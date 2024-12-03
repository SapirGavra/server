import { FC, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { Menu as MuiMenu, MenuItem, Checkbox } from '@mui/material';
import { Airplane, FilterType } from "../Utils/types";
import { handleFilterChange } from './handleFilterChange';

interface MenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
    isSelectedKeyRef: MutableRefObject<keyof Airplane>;
    filters: MutableRefObject<FilterType>;
    setRows: Dispatch<SetStateAction<Airplane[]>>;
    SortKey: MutableRefObject<string>;
    SortDirection: MutableRefObject<string>;
    isAllRowsAmountColumnRef: MutableRefObject<Airplane[]>;
}

const FilterMenu: FC<MenuProps> = ({ anchorEl, setAnchorEl, isSelectedKeyRef, filters, setRows, SortKey, SortDirection, isAllRowsAmountColumnRef }) => {

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    return (

            <MuiMenu  anchorEl={anchorEl} open={Boolean(anchorEl) && isSelectedKeyRef.current !== 'size'} onClose={handleMenuClose}>
                {isSelectedKeyRef.current &&
                    Array.from(new Set(isAllRowsAmountColumnRef.current.map(item => item[isSelectedKeyRef.current])))
                        .sort()
                        .map(value => {
                            return (
                                <MenuItem key={value}>
                                    <Checkbox
                                        checked={filters.current.checkbox.get(isSelectedKeyRef.current)?.has(value) || false  }
                                        onChange={() => handleFilterChange(isSelectedKeyRef.current,value,filters, setRows,SortKey,SortDirection)}
                                    />
                                    {value}
                                </MenuItem>
                            );
                        })
                }
            </MuiMenu>
    );
};

export default FilterMenu;
