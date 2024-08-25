import React, { useState, useEffect, useRef, UIEvent, MouseEvent, FC } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Airplane } from "../types/Airplane";
import { columns } from "../types/Column";
import TruncatedCell from './TruncatedCell';
import { handleFilterChange } from './handleFilterChange';
import './BasicTable.css';

const BasicTable: FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [AllDataLength, setAllDataLength] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Airplane; direction: 'asc' | 'desc' } | null>(null);

    const [allRows, setAllRows] = useState<Airplane[]>([]); // Store all rows here
    const [rows, setRows] = useState<Airplane[]>([]);
    const [allRowsToColumn, setAllRowsToColumn] = useState<Airplane[]>([]); // Store all rows here

    const loadingRef = useRef<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedKey, setSelectedKey] = useState<keyof Airplane | null>(null);
    const [filterValues, setFilterValues] = useState<{ [key in keyof Airplane]?: Set<string | number> }>({});

    const isFilterModeRef = useRef<boolean>(false);

    // const [isFilterMode, setIsFilterMode] = useState(false);

    useEffect(() => {
        console.log('row:', rows);
    }, [rows]);

    useEffect(() => {
        console.log('rowall:', allRows);
    }, [allRows]);


    // Fetch initial data once
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch('http://localhost:3000/airplanes/initial');
                if (!response.ok) {
                    throw new Error('Failed to fetch initial data');
                }
                const data = await response.json();
                setAllRowsToColumn(data.allRows);
                setAllDataLength(data.AllDataLength);
            } catch (error) {
                setError('Failed to fetch data');
            }
        };

        fetchInitialData();
    }, [])




    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/airplanes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRows(data.data);

            } catch (error) {
                setError('Failed to fetch data');
            }
        };

        fetchData();
    }, []);




    const startLoading = async () => {
        loadingRef.current = true;
        const response = await fetch(`http://localhost:3000/airplanes?loadingRef=${loadingRef.current}`);
        return response;
    };

    const stopLoading = async () => {
        loadingRef.current = false;
        await fetch(`http://localhost:3000/airplanes?loadingRef=${loadingRef.current}`);
    };

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

        // Check if the user has scrolled to the bottom of the container
        if (scrollHeight - scrollTop <= clientHeight + 5 && !loadingRef.current) {
            try {
                const response = await startLoading(); // Notify the server that loading should start
                const newRows = await response.json();

                setRows(newRows.data);
                setCurrentIndex(newRows.currentIndex)

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                await stopLoading();
            }
        }
    };

    const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, key: keyof Airplane) => {
        setAnchorEl(event.currentTarget);
        setSelectedKey(key);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedKey(null);
    };


    const handleSort = async (key: keyof Airplane) => {
        const direction: 'asc' | 'desc' = sortConfig && sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });

        try {
            const response = await fetch(`http://localhost:3000/airplanes?sortKey=${key}&sortDirection=${direction}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
                setRows(data.data);
            setCurrentIndex(data.currentIndex);
            setAllDataLength(data.AllDataLength);
        } catch (error) {
            setError('Failed to fetch data');
        }
    };

    const getRows = () => {
        return !isFilterModeRef.current ? rows: allRows;
    };

    if (error) {
        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                {error}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
    return (
        <TableContainer component={Paper} onScroll={handleScroll}>
            <Table sx={{ backgroundColor: '#222220' }} aria-label="simple table">
                <TableHead sx={{ backgroundColor: 'black', textAlign: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.key} sortDirection={sortConfig?.key === column.key ? sortConfig.direction : false}>
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
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {getRows().map((row) => (
                        <TableRow key={row.id}>
                            <TableCell sx={{ color: 'white' }} align="center">
                                {row.id}
                            </TableCell>
                            <TruncatedCell text={row.type} maxLength={10} />
                            <TableCell sx={{ color: 'white' }} align="center">{row.capacity}</TableCell>
                            <TableCell sx={{ color: 'white' }} align="center">{row.size}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={4} align="center">
                            {isFilterModeRef.current ? null :
                                (loadingRef.current && currentIndex < AllDataLength ) || (!error) ? <CircularProgress /> : null}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {selectedKey && Array.from(new Set((allRowsToColumn).map(item => item[selectedKey])))
                    .sort()
                    .map(value => (
                        <MenuItem key={value}>
                            <Checkbox
                                checked={filterValues[selectedKey]?.has(value) || false}
                                onChange={() => handleFilterChange(selectedKey, value, filterValues, setFilterValues, isFilterModeRef,setAllRows)}
                            />
                            {value}
                        </MenuItem>
                    ))}
            </Menu>
        </TableContainer>
    );
};

export default BasicTable;
