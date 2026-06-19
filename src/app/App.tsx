import { useState } from 'react';
import { Box, Typography, Snackbar, IconButton, Tooltip } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { Terminal } from './components/Terminal';
import { PreviewModal } from './components/PreviewModal';
import { callAi, fetchExtendedRepoData, generateReadme } from './utils/api';
import type { ChatMessage, LogEntry } from './types';
import { Landing } from './components/Landing';
import { MarkdownEditor } from './components/MarkdownEditor';

export const App = () => {
  const [state, setState] = useState<'LANDING' | 'PROCESSING' | 'COMPLETED'>('LANDING');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const addLog = (message: string) => {
    return new Promise<void>((resolve) => {
      const uniqueId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      setLogs((prev) => [
        ...prev, 
        { 
          id: uniqueId, 
          message, 
          timestamp: new Date(), 
          onComplete: resolve
        }
      ]);
    });
  };

  const handleGenerate = async () => {
    setState('PROCESSING');
    await addLog("npm run gen-a-readme");
    await addLog("");
    await addLog("vite v5.4.0  building for production documentation...");
    
    try {
      const repoData = await fetchExtendedRepoData(url);
      await addLog(`✓ resolved repository hook for target: ${repoData.meta.name}`);
      await addLog("transforming project architecture modules...");
      
      let history: ChatMessage[] = [];

      for (let currentPart = 1; currentPart <= 4; currentPart++) {
        
        const sectionLabels: Record<number, string> = {
          1: "Overview & Tagline",
          2: "Tech Stack & Tools",
          3: "Project Structure Tree",
          4: "Getting Started & Key Features"
        };

        await addLog(`  transforming chunk [${currentPart}/4] │ src/sections/${sectionLabels[currentPart]}.md`);

        const stepResult = await generateReadme(currentPart, history, repoData);
        history = stepResult.updatedHistory;
        history.push({ 
          role: 'user', 
          parts: [{ 
            text: `Summarize your architectural reasoning and chunk decisions from the previous prompt as a dense, raw telemetry log.
            CRITICAL: Do not use any personal pronouns (like 'I', 'my', 'we') or passive verbs (like 'was', 'did'). Format the response
            as a continuous sequence of fragmented engineering notes using direct goals (e.g., 'Primary goal is...') and active present
            participles (e.g., 'Analyzing...', 'Focusing...', 'Filtering...') in 3-4 sentence.`
          }] 
        });
        
        const explanation = await callAi(history);
        history.push({ role: 'model', parts: [{ text: explanation }] });
        
        await addLog(`  ↳ [telemetry-insight]: ${explanation}\n`);
      }

      await addLog("✓ modules transformed. bundling output schemas...");
      await addLog("rendering final markdown chunks...");

      history.push({ 
        role: 'user', 
        parts: [{ text: "Now assemble all generated sections into a single, seamless README.md markdown document. Return ONLY the markdown content inside a single block. Do not include markdown wraps like ```markdown at the start or end." }] 
      });
      
      const markdownFile = await callAi(history);
      setMarkdown(markdownFile);

      const fileBytes = new Blob([markdownFile]).size;
      const fileSizeKb = (fileBytes / 1024).toFixed(2);
      await addLog("");
      await addLog(`dist/README.md                 ${fileSizeKb} kB │ platform: target-independent`);
      await addLog(`✓ built successfully.`);

      setState('COMPLETED');
    } catch (err) {
      console.error(err);
      await addLog(`✗ build failed with errors: ${err instanceof Error ? err.message : 'Unknown compilation exception.'}`);
      setState('COMPLETED'); 
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setSnackbarOpen(true);
  };

  const handleReset = () => {
    setMarkdown('');
    setLogs([]);
    setUrl('');
    setState('LANDING');
  };

  return (
    <Box sx={{ 
      bgcolor: '#0f1117', 
      color: '#e0e6ed', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' 
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        p: 3,
        borderBottom: '1px solid #2d333b'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Gen-a-README</Typography>
        <Tooltip title="Reset"><IconButton onClick={handleReset} sx={{ color: '#e0e6ed' }}><RestoreIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {state === 'LANDING' ? (
        <Landing onGenerate={handleGenerate} onUrlChange={(e) => setUrl(e.target.value)} />
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          flexGrow: 1, 
          gap: 2, 
          p: 3, 
          overflow: 'hidden', 
          minHeight: 0 
        }}>
          <Terminal logs={logs} />

          <MarkdownEditor
            state={state} 
            onCopy={handleCopy}
            onPreview={() => setIsModalOpen(true)}
            onEdit={(e) => setMarkdown(e.target.value)}
            markdown={markdown}          
          />
        </Box>
      )}

      <PreviewModal open={isModalOpen} onClose={() => setIsModalOpen(false)} markdown={markdown} />
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} message="Copied to clipboard!" />
    </Box>
  );
};