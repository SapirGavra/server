import { FC, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { Popover as MuiPopover, TextField, Typography, Box, Button,IconButton } from '@mui/material';
import { Airplane, FilterType } from "../Utils/types";
import { handleFilterChangeRange } from './handleFilterChangeRange';

interface PopoverProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
    isSelectedKeyRef: MutableRefObject<keyof Airplane>;
    filters: MutableRefObject<FilterType>;
    setRows: Dispatch<SetStateAction<Airplane[]>>;
    SortKey: MutableRefObject<string>;
    SortDirection: MutableRefObject<string>;
}

const FilterPopover: FC<PopoverProps> = ({ anchorEl, setAnchorEl, isSelectedKeyRef, filters, setRows, SortKey, SortDirection }) => {


    const handleMenuCloseRange = () => {
        setAnchorEl(null);
    };
    const handleMenuClearRange = () => {
        setAnchorEl(null);
        if (filters.current.range.size > 0) {
            filters.current.range.delete(isSelectedKeyRef.current);
            handleFilterChangeRange(isSelectedKeyRef.current,filters, setRows,SortKey,SortDirection);
        }
    };

  return (
            <MuiPopover
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                open={Boolean(anchorEl) && isSelectedKeyRef.current === 'size'}
                anchorEl={anchorEl}
                onClose={handleMenuCloseRange}
            >
                <Box p={2} width={300}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>Filter by Size</Typography>
                        <IconButton onClick={handleMenuCloseRange}>
                        </IconButton>
                    </Box>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault(); // Prevent form refresh
                            handleFilterChangeRange(isSelectedKeyRef.current,filters, setRows,SortKey,SortDirection);
                            handleMenuCloseRange();
                        }}
                    >
                        <TextField
                            autoFocus
                            margin="dense"
                            id="minSize"
                            label="Min Size"
                            type="number"
                            variant="outlined"
                            defaultValue={filters.current.range.get(isSelectedKeyRef.current)?.min ?? undefined}
                            onChange={({ target }) => {
                                const currentFilter = filters.current.range.get(isSelectedKeyRef.current) || { min: 0, max: 0 };
                                const newMin = parseFloat(target.value);

                                filters.current.range.set(isSelectedKeyRef.current, {
                                    ...currentFilter,
                                    min: isNaN(newMin) ? currentFilter.min : newMin,
                                    max: currentFilter.max,
                                });
                            }}
                        />
                        <TextField
                            margin="dense"
                            id="maxSize"
                            label="Max Size"
                            type="number"
                            variant="outlined"
                            defaultValue={filters.current.range.get(isSelectedKeyRef.current)?.max ?? undefined}
                            onChange={({ target }) => {
                                const currentFilter = filters.current.range.get(isSelectedKeyRef.current) || { min: 0, max: 0 };
                                const newMax = parseFloat(target.value);

                                filters.current.range.set(isSelectedKeyRef.current, {
                                    ...currentFilter,
                                    min: currentFilter.min,
                                    max: isNaN(newMax) ? currentFilter.max : newMax,
                                });
                            }}
                        />
                        <Box mt={1} display="flex" justifyContent="flex-end">
                            <Button onClick={handleMenuClearRange} color="primary">Clear</Button>
                            <Button type="submit" color="primary" style={{ marginLeft: 8 }}>Apply</Button>
                        </Box>
                    </form>
                </Box>
            </MuiPopover>
    );
};

export default FilterPopover;
