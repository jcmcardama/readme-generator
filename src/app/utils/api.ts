import type { RepoData } from '../types';

export const fetchRepoData = async (url: string): Promise<RepoData> => {
  const repoPath = url.replace('https://github.com/', '');
  const response = await fetch(`https://api.github.com/repos/${repoPath}`);
  if (!response.ok) throw new Error('Failed to fetch repo');
  return response.json();
};

export const generateReadme = async (data: RepoData): Promise<string> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Define a priority list of models
  const models = ["models/gemini-3.5-flash", "models/gemini-2.0-flash", "models/gemini-2.5-flash"];

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate a professional README for this repo: ${JSON.stringify(data)}` }] }]
        })
      });

      if (response.status === 503) continue; // Try the next model
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const json = await response.json();
      return json.candidates[0].content.parts[0].text;
    } catch (e) {
      console.warn(`Model ${modelName} failed with error:`, e); 
    }
  }
  
  throw new Error("All models are currently unavailable. Please try again in a few minutes.");
};