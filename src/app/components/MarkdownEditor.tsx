import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MarkDownEditorProps } from '../types';

export const MarkdownEditor = ({ state, onCopy, onPreview, onEdit, markdown }: MarkDownEditorProps) => {
  return (
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
                <Tooltip title="Copy"><IconButton onClick={onCopy} sx={{ color: '#e0e6ed' }}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Preview"><IconButton onClick={onPreview} sx={{ color: '#e0e6ed' }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
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
                onChange={onEdit}
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
  );
};