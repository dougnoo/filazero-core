'use client';

import { useState } from 'react';
import { Button, Dialog, DialogContent, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useToast } from '@/shared/context/ToastContext';
import { telemedicineService } from '../../services/telemedicineService';

export default function ConnectDoctorButton() {
  const { showError } = useToast();
  const [open, setOpen] = useState(false);
  const [telemedicineUrl, setTelemedicineUrl] = useState('');
  
  const handleConnectDoctor = async () => {
    try {
      const magicLink = await telemedicineService.getMagicLink();
      setTelemedicineUrl(magicLink);
      setOpen(true);
    } catch {      
      showError('Erro ao conectar com médico. Tente novamente mais tarde.');
    }
  };
  
  return (
    <>
      <Button 
        variant="contained" 
        color="primary"
        fullWidth
        onClick={handleConnectDoctor}
      >
        Conectar com médico conveniado
      </Button>
      
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth={false}
        fullScreen
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ width: '100%', height: '100vh' }}>
            <iframe
              src={telemedicineUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Telemedicina"
              sandbox='allow-forms allow-scripts allow-same-origin allow-popups'
              allow="camera; microphone; display-capture"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
