import { Airplane } from "../Utils/types";
import React, { Dispatch, MutableRefObject } from 'react';
import axios from "axios";

type FilterValues = { [key in keyof Airplane]?: Set<string | number> };

const startFilter = async (
    isFilterModeRangeRef: MutableRefObject<boolean>,
    isFilterModeRef: MutableRefObject<boolean>,
    filterValues: FilterValues
) => {
    isFilterModeRef.current = true;
    const serializedFilters = Object.fromEntries(
        Object.entries(filterValues).map(([key, value]) => [key, Array.from(value!)])
    );

    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            filterValues: JSON.stringify(serializedFilters),
            isFilterModeRef: isFilterModeRef.current,
            isFilterModeRangeRef: isFilterModeRangeRef.current,

        }
    });

    return response;
};

const stopFilter = async (isFilterModeRef: MutableRefObject<boolean>) => {
    isFilterModeRef.current = false;
    await axios.get('http://localhost:3000/airplanes', {
        params: {
            isFilterModeRef: isFilterModeRef.current,
        }
    });
};

export const handleFilterChange = async (
    key: keyof Airplane,
    value: string | number,
    filterValues: FilterValues,
    setFilterValues: Dispatch<React.SetStateAction<FilterValues>>,
    isFilterModeRef: MutableRefObject<boolean>,
    isFilterModeRangeRef: React.MutableRefObject<boolean>,
    setFilteredRows: Dispatch<React.SetStateAction<Airplane[]>>
) => {
    const updatedFilterValues = { ...filterValues };
    if (!updatedFilterValues[key]) {
        updatedFilterValues[key] = new Set();
    }
    if (updatedFilterValues[key]!.has(value)) {
        updatedFilterValues[key]!.delete(value);
        if (updatedFilterValues[key]!.size === 0) {
            delete updatedFilterValues[key];
        }
    } else {
        updatedFilterValues[key]!.add(value);
    }
    setFilterValues(updatedFilterValues);
    const isFiltersEmpty = Object.keys(updatedFilterValues).length === 0;

    try {
        const response = await startFilter(isFilterModeRangeRef,isFilterModeRef, updatedFilterValues);
        const newRows = response.data;
        setFilteredRows(newRows.data);

        if (isFiltersEmpty) {
            await stopFilter(isFilterModeRef);
        }
    } catch (error) {
        console.error('Failed to fetch data', error);
    }
};