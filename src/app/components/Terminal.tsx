import { useEffect, useRef, useCallback } from 'react';
import type { LogEntry } from '../types';
import { TypewriterLine } from './TypewriterLine';
import { formatTime } from '../utils/formatTime';
import { Box, Typography } from '@mui/material';

export const Terminal = ({ logs }: { logs: LogEntry[] }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  return (
    <Box 
      sx={{ 
        bgcolor: '#010409', 
        borderRadius: 2, 
        border: '1px solid #2d333b', 
        p: 2,
        display: 'flex',          
        flexDirection: 'column',  
        minHeight: 0,             
        flexGrow: 1               
      }}
    >
      <Typography variant="caption" sx={{ color: '#8b949e', mb: 1, display: 'block' }}>TERMINAL</Typography>
      <div ref={terminalEndRef} className="terminal-container">
        {logs.map((log) => (
          <div 
            key={log.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              margin: '0.2rem 0', 
              fontSize: '0.85rem',
              lineHeight: '1.4'
            }}
          >
            <span style={{ color: '#8b949e', fontFamily: 'monospace', flexShrink: 0, userSelect: 'none' }}>
              [{formatTime(log.timestamp)}]
            </span>
            
            <TypewriterLine 
              text={log.message} 
              onCharacterTyped={scrollToBottom} 
              onComplete={log.onComplete}
            />
          </div>
        ))}
      </div>
    </Box>
  );
};