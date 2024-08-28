import { Airplane } from "../Utils/types";
import React, { Dispatch, MutableRefObject } from 'react';

type FilterValues = { [key in keyof Airplane]?: Set<string | number> };

const startFilter = async (
    isFilterModeRef: MutableRefObject<boolean>,
    filterValues: FilterValues
) => {
    // Set filter mode to true
    isFilterModeRef.current = true;

    // Convert the Set to an array before serializing
    const serializedFilters = encodeURIComponent(JSON.stringify(
        Object.fromEntries(
            Object.entries(filterValues).map(([key, value]) => [key, Array.from(value!)])
        )
    ));

    // Send the filter values to the server
    const response = await fetch(`http://localhost:3000/airplanes?isFilterModeRef=${isFilterModeRef.current}&filterValues=${serializedFilters}`);
    return response;
};

const stopFilter = async (isFilterModeRef: MutableRefObject<boolean>) => {
    // Set filter mode to false
    isFilterModeRef.current = false;

    // Optionally notify the server that filtering has stopped
    await fetch(`http://localhost:3000/airplanes?isFilterModeRef=${isFilterModeRef.current}`);
};

export const handleFilterChange = async (
    key: keyof Airplane,
    value: string | number,
    filterValues: FilterValues,
    setFilterValues: Dispatch<React.SetStateAction<FilterValues>>,
    isFilterModeRef: MutableRefObject<boolean>,
    setAllRows: Dispatch<React.SetStateAction<Airplane[]>>
) => {
    // Update filterValues with the new filter selection
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
        const response = await startFilter(isFilterModeRef, updatedFilterValues);
        const newRows = await response.json();
        setAllRows(newRows.data);
        if (isFiltersEmpty) {
            await stopFilter(isFilterModeRef);


        }
    } catch (error) {
        console.error('Failed to fetch data', error);
    }
};
