import { Box, Modal, IconButton, Typography, Tooltip, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
}

export const PreviewModal = ({ open, onClose, markdown }: PreviewModalProps) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className="preview-modal-box">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#e0e6ed' }}>README Preview</Typography>
            <Box>
              <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: '#e0e6ed' }}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Close"><IconButton onClick={onClose} sx={{ color: '#e0e6ed' }}><CloseIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
          </Box>
          
          <Box className="markdown-body markdown-preview-container">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </Box>
        </Box>
      </Modal>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Copied to clipboard!"
      />
    </>
  );
};