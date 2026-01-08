import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';
import {useState} from 'react';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export default function ConfirmationDialog({
                                               open,
                                               onClose,
                                               onConfirm,
                                               title,
                                               description,
                                           }: ConfirmationDialogProps) {
    const [inputValue, setInputValue] = useState('');
    const confirmationText = 'delete';

    const isConfirmed = inputValue.toLowerCase() === confirmationText;

    const handleConfirm = () => {
        if (isConfirmed) {
            onConfirm();
            setInputValue(''); // Reset for next time
        }
    };

    const handleClose = () => {
        onClose();
        setInputValue(''); // Reset on close
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{mb: 2}}>
                    {description}
                    <br/>
                    To confirm, please type "<strong>{confirmationText}</strong>" in the box below.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="confirmation-text"
                    label="Confirmation"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && isConfirmed && handleConfirm()}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={!isConfirmed}
                >
                    Confirm Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
