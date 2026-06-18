import { useState } from 'react';
import { TextField, Box, Typography, IconButton, Snackbar, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Terminal } from './components/Terminal';
import { PreviewModal } from './components/PreviewModal';
import { callAi, fetchExtendedRepoData, generateReadme } from './utils/api';
import type { ChatMessage, LogEntry } from './types';
import Landing from './pages/Landing';

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
    await addLog("Starting process...");
    
    try {
      const repoData = await fetchExtendedRepoData(url);
      await addLog(`Success: Found ${repoData.meta.name}`);
      
      let history: ChatMessage[] = [];

      for (let currentPart = 1; currentPart <= 4; currentPart++) {
        
        const sectionLabels: Record<number, string> = {
          1: "Overview & Tagline",
          2: "Tech Stack & Tools",
          3: "Project Structure Tree",
          4: "Getting Started & Key Features"
        };

        await addLog(`System: Formulating and processing ${sectionLabels[currentPart]}...`);
        
        const stepResult = await generateReadme(currentPart, history, repoData);
        
        history = stepResult.updatedHistory;

        history.push({ 
          role: 'user', 
          parts: [{ text: "Briefly explain in 3-4 sentences what you were thinking and your reasoning behind your decisions in the previous prompt." }] 
        });
        
        const explanation = await callAi(history);
        
        history.push({ role: 'model', parts: [{ text: explanation }] });
        
        await addLog(`${explanation}\n`);
      }
      await addLog("System: Compiling and formatting the complete cohesive Markdown document structure...");

      history.push({ 
        role: 'user', 
        parts: [{ text: "Now assemble all generated sections into a single, seamless README.md markdown document. Return ONLY the markdown content inside a single block. Do not include markdown wraps like ```markdown at the start or end." }] 
      });
      
      const markdownFile = await callAi(history);
      setMarkdown(markdownFile);

      await addLog("Process complete! All sections generated and compiled successfully.");
      setState('COMPLETED');
    } catch (err) {
      console.error(err);
      await addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred.'}`);
      setState('COMPLETED'); 
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setSnackbarOpen(true);
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
      <Box sx={{ p: 3, borderBottom: '1px solid #2d333b' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>README.ai</Typography>
      </Box>

      {state === 'LANDING' ? (
        <Landing 
          onGenerate={handleGenerate}
          onUrlChange={(e) => setUrl(e.target.value)}
        />
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
          {/* Left Panel: Terminal */}
          <Terminal logs={logs} />

          {/* Right Panel: Markdown Editor */}
          <Box 
            sx={{ 
              bgcolor: '#161b22', 
              borderRadius: 2, 
              border: '1px solid #2d333b', 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: 0, 
              flexGrow: 1 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#8b949e' }}>RAW MARKDOWN</Typography>
              <Box>
                <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: '#e0e6ed' }}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Preview"><IconButton onClick={() => setIsModalOpen(true)} sx={{ color: '#e0e6ed' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            
            {state === 'PROCESSING' ? (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>✨ Generating your README...</Typography>
              </Box>
            ) : (
              <TextField 
                multiline 
                fullWidth 
                value={markdown} 
                onChange={(e) => setMarkdown(e.target.value)}
                sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  '& .MuiInputBase-root': { 
                    flexGrow: 1,
                    padding: '16px',
                    boxSizing: 'border-box',
                    overflowY: 'auto !important' 
                  },
                  '& .MuiInputBase-input': { 
                    fontFamily: 'monospace', 
                    color: '#e0e6ed', 
                    fontSize: '14px',
                    height: '100% !important',    
                    minHeight: '100% !important', 
                    overflowY: 'auto !important', 
                    padding: '0 !important'
                  } 
                }}
              />
            )}
          </Box>
        </Box>
      )}
      <PreviewModal open={isModalOpen} onClose={() => setIsModalOpen(false)} markdown={markdown} />
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} message="Copied to clipboard!" />
    </Box>
  );
};