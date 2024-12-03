import React, { useState, useEffect, useRef, UIEvent, MouseEvent, FC } from 'react';
import axios from 'axios';
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableSortLabel, IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Airplane, columns, FilterType } from "../Utils/types";
import './BasicTable.css';
import { StyledTableCell, StyledTableRow } from "./StyleTable";
import Menu from './Menu';
import Popover from './Popover';


const INIT_CURRENT_ROWS_AMOUNT_VALUE = 0;
const INIT_ALL_ROWS_AMOUNT_VALUE = 0;
const INIT_IS_SORTED_REF = false;
const INIT_IS_LOADING_REF = false;

export const defaultFilters: FilterType = {
    range: new Map<keyof Airplane, { min: 0; max: 0 }>(),
    checkbox: new Map<keyof Airplane, Set<string | number>>(),
    sort: new Map<keyof Airplane, {direction:'asc' | 'desc'}>()
};

const BasicTable: FC = () => {
    const isSelectedKeyRef = useRef<keyof Airplane>('size');
    const isSortedRef = useRef<boolean>(INIT_IS_SORTED_REF);
    const SortKey = useRef<string>('');
    const SortDirection = useRef<string>('');
    const isLoadingRef = useRef<boolean>(INIT_IS_LOADING_REF);
    const isCurrentRowsAmountRef = useRef<number>(INIT_CURRENT_ROWS_AMOUNT_VALUE);
    const isAllRowsAmountRef = useRef<number>(INIT_ALL_ROWS_AMOUNT_VALUE);
    const filters = useRef<FilterType>(defaultFilters);
    const [rows, setRows] = useState<Airplane[]>([]);
    const isAllRowsAmountColumnRef = useRef<Airplane[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


    useEffect(() => {
        console.log('Rows:', rows);
    }, [rows]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/airplanes/initial');
                isAllRowsAmountColumnRef.current = response.data.isAllRowsAmountColumnRef;
                isAllRowsAmountRef.current = response.data.isAllRowsAmountRef;
            } catch (error) {
                setError('Failed to fetch initial data');
            }
        };
        fetchInitialData();
    }, []);

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
    const startLoading = async () => {
        isLoadingRef.current = true;
        const response = await axios.get(`http://localhost:3000/airplanes`, {
            params: {
                isLoadingRef: isLoadingRef.current,
                SortKey : SortKey.current,
                sortDirection : SortDirection.current
            }
        });
        return response;
    };
    const stopLoading = async () => {
        if (filters.current.checkbox.size == 0) {
            isLoadingRef.current = false;
            await axios.get(`http://localhost:3000/airplanes`, {
                params: {
                    isLoadingRef: isLoadingRef.current,

                }
            });
        }

    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (!isLoadingRef.current && (scrollHeight - scrollTop <= clientHeight) && filters.current.range.size===0 && filters.current.checkbox.size ===0) {
            try {
                const response = await startLoading();
                const newRows = response.data;
                setRows(newRows.data);
                isCurrentRowsAmountRef.current = newRows.isCurrentRowsAmount

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                await stopLoading();
            }
        };
    }

    const handleSort = async (key: keyof Airplane) => {
        filters.current.sort.clear();
        const direction = filters.current.sort.has(key) && filters.current.sort.get(key)?.direction === 'asc' ? 'desc' : 'asc';
        filters.current.sort.set(key,{direction: direction})
        isSortedRef.current = true;
        SortKey.current = key;
        SortDirection.current = direction
        const min = filters.current.range.get(key)?.min;
        const max = filters.current.range.get(key)?.max;

        const serializedFilters = Object.fromEntries(
            Array.from(filters.current.checkbox.entries()).map(([key, value]) => [key, Array.from(value)])
        );

        try {
            const response = await axios.get('http://localhost:3000/airplanes', {
                params: {
                    sortKey: key,
                    sortDirection: direction,
                    filterValues: JSON.stringify(serializedFilters),
                    minSize: min,
                    maxSize: max,

                }
            });

            const data = response.data;
            setRows(data.data);
            isCurrentRowsAmountRef.current = data.isCurrentRowsAmountRef
        } catch (error) {
            setError('Failed to fetch data');
        }
    };
    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, key: keyof Airplane) => {
        setAnchorEl(event.currentTarget);
        isSelectedKeyRef.current = key;
    };
    const handleMenuOpenRange = (event: MouseEvent<HTMLButtonElement>, key: keyof Airplane) => {
        setAnchorEl(event.currentTarget);
        isSelectedKeyRef.current = key;
    };

    if (error) {
        return (
            <TableContainer sx={{ width: '80%', marginX: 'auto', marginTop: '50vh' }} component={Paper}>
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

    return (
        <TableContainer sx={{ width: '80%', marginX: 'auto', marginTop: '10vh' }} component={Paper} onScroll={handleScroll}>
            <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <StyledTableCell key={column.key} sortDirection={filters.current.sort.get(column.key)?.direction}>
                                <TableSortLabel
                                    active={filters.current.sort.has(column.key)}
                                    direction={filters.current.sort.has(column.key) ? filters.current.sort.get(column.key)?.direction : 'asc'}
                                    onClick={() => handleSort(column.key)}
                                >
                                    {column.label}
                                </TableSortLabel>
                                <IconButton
                                    onClick={(event) =>
                                        column.key === 'size'
                                            ? handleMenuOpenRange(event, column.key)
                                            : handleMenuOpen(event, column.key)
                                    }
                                    size="small"
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </StyledTableCell>
                        ))}
                    </TableRow>

                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <StyledTableRow key={row.id}>
                            <StyledTableCell align="center">{row.id}</StyledTableCell>
                            <StyledTableCell align="center">{row.type}</StyledTableCell>
                            <StyledTableCell align="center">{row.capacity}</StyledTableCell>
                            <StyledTableCell align="center">{row.size}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                    <StyledTableRow>
                        <StyledTableCell colSpan={4} align="center">
                            { filters.current.range.size ===0 && filters.current.checkbox.size ===0 && isCurrentRowsAmountRef.current < isAllRowsAmountRef.current && (
                                <CircularProgress />
                            )}
                        </StyledTableCell>
                    </StyledTableRow>
                </TableBody>
            </Table>
            <Menu anchorEl={anchorEl} setAnchorEl={setAnchorEl} isSelectedKeyRef={isSelectedKeyRef} filters={filters}
                  setRows={setRows} SortKey={SortKey} SortDirection={SortDirection} isAllRowsAmountColumnRef={isAllRowsAmountColumnRef}
            />
            <Popover anchorEl={anchorEl} setAnchorEl={setAnchorEl} isSelectedKeyRef={isSelectedKeyRef} filters={filters}
                  setRows={setRows} SortKey={SortKey} SortDirection={SortDirection}
            />
        </TableContainer>
    );
};

export default BasicTable;
