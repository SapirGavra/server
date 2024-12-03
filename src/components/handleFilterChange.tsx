import { Airplane, FilterType } from "../Utils/types";
import React, { Dispatch, MutableRefObject, SetStateAction } from 'react';
import axios from "axios";

const startFilter = async (
    Filters: FilterType,
    SortKey: MutableRefObject<String>,
    SortDirection: MutableRefObject<String>,
    min?: number,
    max?: number
) => {
    const serializedFilters = Object.fromEntries(
        Array.from(Filters.checkbox.entries()).map(([key, value]) => [key, Array.from(value)])
    );
    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            filterValues: JSON.stringify(serializedFilters),
            SortKey : SortKey.current,
            sortDirection : SortDirection.current,
            minSize: min,
            maxSize: max,
        }
    });

    return response;
};

const stopFilter =async (
    Filters: FilterType,
) => {
    const serializedFilters = Object.fromEntries(
        Array.from(Filters.checkbox.entries()).map(([key, value]) => [key, Array.from(value)])
    );
    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            filterValues: JSON.stringify(serializedFilters),
        }
    });

    return response;
};

export const handleFilterChange = async (
    key: keyof Airplane,
    value: string | number,
    Filters: MutableRefObject<FilterType>,
    setFilteredRows: Dispatch<SetStateAction<Airplane[]>>,
    SortKey: MutableRefObject<String>,
    SortDirection: MutableRefObject<String>
) => {



    const min = Filters.current.range.get(key)?.min ?? undefined;
    const max = Filters.current.range.get(key)?.max ?? undefined;

    const updatedFilterValues = {...Filters.current};

    if (!updatedFilterValues.checkbox.has(key)) {
        updatedFilterValues.checkbox.set(key, new Set());
    }

    if (updatedFilterValues.checkbox.get(key)!.has(value)) {
        updatedFilterValues.checkbox.get(key)!.delete(value);

        if (updatedFilterValues.checkbox.get(key)!.size === 0) {
            updatedFilterValues.checkbox.delete(key);

        }

    } else {
        updatedFilterValues.checkbox.get(key)!.add(value);

    }

    Filters.current.checkbox = updatedFilterValues.checkbox;

    const isFiltersEmpty = updatedFilterValues.checkbox.size === 0;


    try {
        const response = await startFilter(Filters.current,SortKey,SortDirection,min,max);
        const newRows = response.data;
        setFilteredRows(newRows.data);
        if (isFiltersEmpty) {
            await stopFilter(Filters.current);
        }
    } catch (error) {
        console.error('Failed to fetch data', error);
    }
};
