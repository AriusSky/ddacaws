import { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, Divider, Tooltip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppBadIcon from '@mui/icons-material/GppBad';
import { adminService } from '../../services/AdminServices';
import type { BlockchainStatus } from '../../types';
import { toast } from 'react-toastify';

export default function BlockchainVerify() {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const data = await adminService.verifyBlockchain();
      setStatus(data);
      setLastChecked(new Date().toLocaleString());
      
      if (data.isValid) {
        toast.success("Blockchain integrity verified!");
      } else {
        toast.error("Tampering detected in blockchain!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to blockchain service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Blockchain Integrity
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Cryptographically verify the immutability of all stored medical records.
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <SecurityIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Ledger Verification System
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Click the button below to recalculate hashes for the entire medical record chain and verify consistency.
        </Typography>

        <Button 
          variant="contained" 
          size="large" 
          onClick={handleVerify} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VerifiedUserIcon />}
          sx={{ mt: 2, mb: 4, px: 4, py: 1.5 }}
        >
          {loading ? "Verifying Chain..." : "Run Integrity Check"}
        </Button>

        {status && (
          <Box sx={{ textAlign: 'left', mt: 2 }}>
            <Divider sx={{ mb: 3 }} />
            
            {status.isValid ? (
              <Alert icon={<VerifiedUserIcon fontSize="inherit" />} severity="success" sx={{ mb: 2 }}>
                <strong>System Secure:</strong> No tampering detected. All block hashes match.
              </Alert>
            ) : (
              <Alert icon={<GppBadIcon fontSize="inherit" />} severity="error" sx={{ mb: 2 }}>
                <strong>Security Alert:</strong> Blockchain integrity compromised. Hashes do not match.
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">Total Blocks Verified:</Typography>
              <Typography variant="body2">{status.totalBlocks}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">Last Block Hash:</Typography>
              <Tooltip title={status.lastBlockHash}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', maxWidth: 200 }} noWrap>
                  {status.lastBlockHash}
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Typography variant="body2" fontWeight="bold">Status:</Typography>
               <Chip 
                 label={status.isValid ? "Valid" : "Corrupted"} 
                 color={status.isValid ? "success" : "error"} 
                 size="small" 
               />
            </Box>

            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              Last checked: {lastChecked}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
