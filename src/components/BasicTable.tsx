import React, { useState, useEffect, useRef, UIEvent, MouseEvent, FC } from 'react';
import axios from 'axios';
// TODO: make all the imports like this, from all the project
import {
    Table, MenuItem, Menu, Checkbox, TableBody, TableContainer, TableHead, TableRow, Paper , CircularProgress, TableSortLabel, IconButton, Popover, TextField,  Typography, Box , Button
} from '@mui/material';import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Airplane, columns, rangeType, sortConfigType} from "../Utils/types";
import { handleFilterChange } from './handleFilterChange';
import './BasicTable.css';
import {StyledTableCell, StyledTableRow} from "./StyleTable"
import {handleFilterChangeRange} from "./handleFilterChangeRange";




const INIT_CURRENT_ROWS_AMOUNT_VALUE = 0;
const INIT_ALL_ROWS_AMOUNT_VALUE = 0;
const INIT_IS_SORTED_REF = false;
const INIT_IS_LOADING_REF = false;
const INIT_IS_FILTER_MODE_REF = false;
const BasicTable: FC = () => {
    // TODO: name it: `currentRowsAmount`, useRef, GLOBAL CONST,
    const isCurrentRowsAmountRef = useRef<number>(INIT_CURRENT_ROWS_AMOUNT_VALUE);

    // TODO: name it: `allRowsAmount`, useRef, GLOBAL CONST,
    const isAllRowsAmountRef = useRef<number>(INIT_ALL_ROWS_AMOUNT_VALUE);

    // I couldn't change useState to useRef
    // const sortConfig = useRef<sortConfigType>(null);

    const [sortConfig, setSortConfig] = useState<sortConfigType | null>(null);
    // TODO: name it: `isSoredRef`
    const isSoredRef = useRef<boolean>(INIT_IS_SORTED_REF);


    // TODO: name it: `filteredRows`
    const [filteredRows, setFilteredRows] = useState<Airplane[]>([]);
    const [rows, setRows] = useState<Airplane[]>([]);

    // TODO: name it: `allRowsAmount`, useRef
    const isAllRowsAmountColumnRef = useRef<Airplane[]>([]);

    const isLoadingRef = useRef<boolean>(INIT_IS_LOADING_REF);

    // I couldn't change useState to useRef
    // const error = useRef<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // I couldn't change useState to useRef
    // const selectedKeyRef = useRef<keyof Airplane | null>(null);

    const [selectedKey, setSelectedKey] = useState<keyof Airplane>('size');
    const [filterValues, setFilterValues] = useState<{ [key in keyof Airplane]?: Set<string | number> }>({});
    const isFilterModeRef = useRef<boolean>(INIT_IS_FILTER_MODE_REF);

    const isFilterModeRangeRef = useRef<boolean>(INIT_IS_FILTER_MODE_REF);


    const [popoverOpen, setPopoverOpen] = useState(false);

    const [sizeRange, setSizeRange] = useState<rangeType>({ min: '', max: ''});

    const [popoverValue, setPopoverValue] = useState<string>('');

    useEffect(() => {
        console.log('row:', rows);
    }, [rows]);

    useEffect(() => {
        console.log('rowall:', filteredRows);
    }, [filteredRows]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/airplanes/initial');
                isAllRowsAmountColumnRef.current = response.data.isAllRowsAmountColumnRef;
                isAllRowsAmountRef.current = response.data.isAllRowsAmountRef
            } catch (error) {
                setError('Failed to fetch data');
            }
        };
        fetchInitialData();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/airplanes');
                setRows(response.data.data);
            } catch (error) {
                setError('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    const handlePopoverOpen = () => {
        setPopoverOpen(true);
    };

    console.log('sizeRange1',sizeRange)
    const handlePopoverClean = () => {
        setAnchorEl(null);
        setPopoverOpen(false);


        if (sizeRange) {
            sizeRange.min='';
            sizeRange.max='';
            handleFilterChangeRange(sizeRange, selectedKey, isFilterModeRangeRef, setFilteredRows);
        }
    };

    const handlePopoverSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sizeRange) {
            handleFilterChangeRange(sizeRange, selectedKey, isFilterModeRangeRef, setFilteredRows);
        }
        handlePopoverClose();
    };




    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverOpen(false);
    };

    const startLoading = async () => {
        isLoadingRef.current = true;
        const response = await axios.get(`http://localhost:3000/airplanes`, {
            params: {
                isLoadingRef: isLoadingRef.current,
            }
        });
        return response;
    };

    const stopLoading = async () => {
        isLoadingRef.current = false;
        await axios.get(`http://localhost:3000/airplanes`, {
            params: {
                isLoadingRef: isLoadingRef.current,
            }
        });
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        if (!isLoadingRef.current &&  isCurrentRowsAmountRef.current < isAllRowsAmountRef.current && !isFilterModeRef.current) {
            try {
                const response = await startLoading();
                const newRows = response.data;
                setRows(newRows.data);
                isCurrentRowsAmountRef.current = newRows.isCurrentRowsAmountRef

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                await stopLoading();
            }
        }
    };

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, key: keyof Airplane) => {
        if (key !== 'size') {
            setAnchorEl(event.currentTarget);
            setSelectedKey(key);
        } else {
            setAnchorEl(event.currentTarget);
            handlePopoverOpen();
        }
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedKey('size');
    };


    const handleSort = async (key: keyof Airplane) => {
        //TODO: change the logic of the sortConfig, dont give `setSortConfig` to this function.
        //TODO: use the type `SortConfig`, and don`t write the type everytime
        const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });

        try {
            isSoredRef.current = true;
            const response = await axios.get('http://localhost:3000/airplanes', {
                params: {
                    sortKey: key,
                    sortDirection: direction,
                    isFilterModeRef: isFilterModeRef.current,
                    isSoredRef: isSoredRef.current,
                }
            });

            const data = response.data;

            if (isFilterModeRef.current && isSoredRef.current) {
                setFilteredRows(data.data);
            } else {
                setRows(data.data);
            }
            isCurrentRowsAmountRef.current = data.isCurrentRowsAmountRef
        } catch (error) {
            setError('Failed to fetch data');
        }
    };

    const getRows = () => {
        if (isFilterModeRef.current || isFilterModeRangeRef.current) {
            return filteredRows;
        } else {
            return rows;
        }
    };




    if (error) {
        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <StyledTableCell colSpan={4} align="center">
                                {error}
                            </StyledTableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    console.log('range',sizeRange)
    return (
        <TableContainer sx={{ width: '80%', marginX: 'auto', marginTop: '10vh'
        }} component={Paper} onScroll={handleScroll}>
            <Table stickyHeader aria-label="sticky table" >
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <StyledTableCell key={column.key} sortDirection={sortConfig?.key === column.key ? sortConfig.direction : false}>
                                <TableSortLabel
                                    active={sortConfig?.key === column.key}
                                    direction={sortConfig?.key === column.key ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort(column.key)}
                                >
                                    {column.label}
                                </TableSortLabel>
                                <IconButton onClick={(event) => handleMenuOpen(event, column.key)} size="small">
                                    <MoreVertIcon />
                                </IconButton>
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {getRows().map((row) => (
                        <StyledTableRow key={row.id}>
                            <StyledTableCell  align="center">
                                {row.id}
                            </StyledTableCell>
                            <StyledTableCell align="center">{row.type}</StyledTableCell>
                            <StyledTableCell align="center">{row.capacity}</StyledTableCell>
                            <StyledTableCell align="center">{row.size}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                    <StyledTableRow>
                        <StyledTableCell colSpan={4} align="center">
                            {isLoadingRef && isCurrentRowsAmountRef.current < isAllRowsAmountRef.current && !isFilterModeRef.current && <CircularProgress />}
                        </StyledTableCell>
                    </StyledTableRow>
                </TableBody>
            </Table>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {selectedKey && Array.from(new Set(isAllRowsAmountColumnRef.current.map(item => item[selectedKey])))
                    .sort()
                    .map(value => (
                        <MenuItem key={value}>
                            <Checkbox
                                checked={filterValues[selectedKey]?.has(value) || false}
                                onChange={() => handleFilterChange(selectedKey, value, filterValues, setFilterValues, isFilterModeRef,isFilterModeRangeRef, setFilteredRows)}
                            />
                            {value}
                        </MenuItem>
                    ))}
            </Menu>
            <Popover
                // sx={{width:'50%',height:'50%'}}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}

            >
                <Box p={2} width={300} >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography >Filter by Size</Typography>
                        <IconButton onClick={handlePopoverClose}>
                        </IconButton>
                    </Box>
                    <form onSubmit={handlePopoverSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="minSize"
                            label="Min Size"
                            type="number"
                            variant="outlined"
                            value={sizeRange?.min}
                            onChange={({target}) => setSizeRange((prev) => ({
                                ...prev,
                                min: target.value,
                                max: prev.max,
                            }))}

                        />
                        <TextField
                            margin="dense"
                            id="maxSize"
                            label="Max Size"
                            type="number"
                            variant="outlined"
                            value={sizeRange.max}
                            onChange={({target}) => setSizeRange((prev) => ({
                                ...prev,
                                min: prev.min,
                                max: target.value,
                            }))}
                        />
                        <Box mt={1} display="flex" justifyContent="flex-end">
                            <Button onClick={handlePopoverClean} color="primary">Clean</Button>
                            <Button type="submit" color="primary" style={{ marginLeft: 8 }}>Apply</Button>
                        </Box>
                    </form>
                </Box>
            </Popover>
        </TableContainer>
    );
};

export default BasicTable;