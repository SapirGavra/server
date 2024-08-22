import React, { FC } from 'react';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';

interface TruncatedCellProps {
    text: string;
    maxLength: number;
}

const TruncatedCell: FC<TruncatedCellProps> = ({ text, maxLength }) => {
    const shouldTruncate = text.length > maxLength;

    return (
        <TableCell
            sx={{
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
            align="center"
        >
            {shouldTruncate ? (
                <Tooltip title={text}>
                    <span>{text.slice(0, maxLength)}...</span>
                </Tooltip>
            ) : (
                <span>{text}</span>
            )}
        </TableCell>
    );
};

export default TruncatedCell;
