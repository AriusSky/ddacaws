import { IconButton, Tooltip, type TooltipProps } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
    // No additional props needed for now
}

export default function InfoTooltip(props: InfoTooltipProps) {
    return (
        <Tooltip {...props}>
            <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
        </Tooltip>
    );
}
