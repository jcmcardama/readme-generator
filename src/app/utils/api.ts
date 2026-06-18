import { ChatMessage, ExtendedRepoData, GitHubRepoMeta, GitHubTreeItem } from "../types";

export const fetchExtendedRepoData = async (url: string): Promise<ExtendedRepoData> => {
  const repoPath = url.replace('https://github.com/', '');
  
  const metaResponse = await fetch(`https://api.github.com/repos/${repoPath}`);
  if (!metaResponse.ok) throw new Error('Failed to fetch repo metadata');
  
  const meta = (await metaResponse.json()) as GitHubRepoMeta;

  const treeResponse = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/${meta.default_branch}?recursive=1`);
  let fileTree: string[] = [];
  
  if (treeResponse.ok) {
    const treeData = (await treeResponse.json()) as { tree: GitHubTreeItem[] };    
    fileTree = treeData.tree
      .map((file: GitHubTreeItem) => file.path)
      .filter((path: string) => !path.startsWith('.') && !path.includes('node_modules/') && !path.includes('dist/'));
  }

  return { meta, fileTree };
};

export const callAi = async (history: ChatMessage[]): Promise<string> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const model = "models/gemini-flash-lite-latest";
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
    }
    
    const json = await response.json();
    return json.candidates[0].content.parts[0].text;
  } catch (e) {
    console.warn(`Model ${model} failed with error:`, e); 
    throw e;
  }
};

export const generateReadme = async (
  part: number, 
  currentHistory: ChatMessage[], 
  data?: ExtendedRepoData
): Promise<{ response: string; updatedHistory: ChatMessage[] }> => {
  const repoMeta = data?.meta;
  const files = data?.fileTree.join('\n');
  
  const getPromptForPart = (): string => {
    switch (part) {
      case 1:
        return `
          Act as an elite technical writer. Generate Part 1 of a professional README.md.
        
          Repository Meta:
          Name: ${repoMeta?.name}
          Description: ${repoMeta?.description || 'Not provided'}
          Primary Language: ${repoMeta?.language}

          Actual Repository File List:
          ${files}

          Generate exactly:
          1. An H1 Header with the repository name and a precise, single-sentence tagline.
          2. A professional "## 🚀 Project Overview" overview paragraph and 4-5 bullet points. 
          CRITICAL: Rely ONLY on the actual files listed above. Do not invent databases, frameworks, or security features if you do not see them in the file list.
        `;
      case 2:
        return `
          Using our established overview, generate "## 🛠️ Tech Stack".
          Based strictly on the primary language (${repoMeta?.language}) and the presence of config files in this list:
          ${files}
          
          List the core languages, runtime engines, and primary tools. Provide a 1-sentence engineering justification for why each component fits this exact file layout. Do not hallucinate external cloud services or databases.
        `;
      case 3:
        return `
          Generate "## 📁 Project Structure".
          Convert the following file path list into a clean, visual ASCII directory tree layout. Group minor files inside their parent directories:
          ${files}
          
          Add clean inline comments with a hash symbol (#) explaining what role each directory plays based on industry standard naming conventions.
        `;
      default:
        return `
          Complete the README with standard installation and operational scripts.
          Based on the file tree, output:
          1. "## 🚀 Getting Started" including Prerequisites, clone command, installation commands, and environmental configurations appropriate for a ${repoMeta?.language} project.
          2. "## ✨ Key Features" using checkmark emojis (✅) highlighting real capabilities shown by the repository architecture.
        `;
    }
  };

  const targetPrompt = getPromptForPart();
  const updatedHistory: ChatMessage[] = [
    ...currentHistory,
    { role: 'user', parts: [{ text: targetPrompt }] }
  ];
  const response = await callAi(updatedHistory);

  updatedHistory.push({ role: 'model', parts: [{ text: response }] });

  return { response, updatedHistory };
};