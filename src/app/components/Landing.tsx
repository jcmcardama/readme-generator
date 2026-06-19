import { Box, TextField, Button } from "@mui/material";
import { LandingProps } from "../types";
import { ReactElement } from "react";

export const Landing = ({ onGenerate, onUrlChange }: LandingProps): ReactElement => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
            <TextField 
                label="GitHub Repository URL" 
                variant="outlined"
                onChange={onUrlChange} 
                autoComplete="off"
                slotProps={{ inputLabel: { sx: { color: '#8b949e' } } }}
                sx={{ 
                width: '500px',
                '& .MuiOutlinedInput-root': { 
                    bgcolor: '#161b22', 
                    color: '#e0e6ed', 
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#58a6ff' }, 
                    '&.Mui-focused fieldset': { borderColor: '#58a6ff' } 
                }
                }}
            />
            <Button variant="contained" onClick={onGenerate} sx={{ mt: 2 }}>Create README</Button>
        </Box>
    );
}