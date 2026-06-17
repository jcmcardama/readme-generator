import { useState } from 'react';
import { Button, TextField, Box, Typography, IconButton, Snackbar, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Terminal } from './components/Terminal';
import { PreviewModal } from './components/PreviewModal';
import { fetchRepoData, generateReadme } from './utils/api';
import type { LogEntry } from './types';

export const App = () => {
  const [state, setState] = useState<'LANDING' | 'PROCESSING' | 'COMPLETED'>('LANDING');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const addLog = (message: string) => 
    setLogs((prev) => [...prev, { id: Date.now().toString(), message, timestamp: new Date() }]);

  const handleGenerate = async () => {
    setState('PROCESSING');
    addLog("Starting process...");
    try {
      const repoData = await fetchRepoData(url);
      addLog(`Success: Found ${repoData.name}`);
      const result = await generateReadme(repoData);
      setMarkdown(result);
      addLog("Process complete!");
      setState('COMPLETED');
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      height: '100vh', // Force to view height
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent body scroll
    }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #2d333b' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>README.ai</Typography>
      </Box>

      {state === 'LANDING' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
           <TextField 
              label="GitHub Repository URL" 
              variant="outlined"
              onChange={(e) => setUrl(e.target.value)} 
              autoComplete="off"
              slotProps={{ inputLabel: { sx: { color: '#8b949e' } } }}
              sx={{ 
                width: '500px',
                '& .MuiOutlinedInput-root': { 
                  bgcolor: '#161b22', 
                  color: '#e0e6ed', // Sets the input text color
                  '& fieldset': { borderColor: '#30363d' },
                  '&:hover fieldset': { borderColor: '#58a6ff' }, // Adds a nice blue highlight on hover
                  '&.Mui-focused fieldset': { borderColor: '#58a6ff' } // Blue border when typing
                } 
              }} 
            />
           <Button variant="contained" onClick={handleGenerate} sx={{ mt: 2 }}>Create README</Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          flexGrow: 1, // Let this fill available vertical space
          gap: 2, 
          p: 3, 
          overflow: 'hidden', // IMPORTANT: Keep it inside the view
          minHeight: 0 // CRITICAL: Allows child flex items to shrink
        }}>
          {/* Left Panel */}
          <Box sx={{ bgcolor: '#010409', borderRadius: 2, border: '1px solid #2d333b', p: 2 }}>
            <Typography variant="caption" sx={{ color: '#8b949e', mb: 1, display: 'block' }}>TERMINAL</Typography>
            <Terminal logs={logs} />
          </Box>

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
                  // Root: defines the scrollable area
                  '& .MuiInputBase-root': { 
                    flexGrow: 1,
                    padding: '16px',
                    boxSizing: 'border-box',
                    overflowY: 'auto !important' // Force scroll here
                  },
                  // The textarea: Force it to fill the root and ignore MUI's inline height
                  '& .MuiInputBase-input': { 
                    fontFamily: 'monospace', 
                    color: '#e0e6ed', 
                    fontSize: '14px',
                    height: '100% !important',    // Override the 5704px injected by MUI
                    minHeight: '100% !important', // Ensure it fills the area
                    overflowY: 'auto !important', // Enable internal scroll
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