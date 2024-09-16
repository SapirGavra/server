import { Airplane, FilterType } from "../Utils/types";
import React, { Dispatch, MutableRefObject, SetStateAction } from 'react';
import axios from "axios";

const startFilter = async (
    Filters: FilterType,
    min: number,
    max: number,
    SortKey: MutableRefObject<String>,
    SortDirection: MutableRefObject<String>
) => {
    const serializedFilters = Object.fromEntries(
        Array.from(Filters.checkbox.entries()).map(([key, value]) => [key, Array.from(value)])
    );

    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            minSize: min,
            maxSize: max,
            sortDirection : SortDirection.current,
            filterValues: JSON.stringify(serializedFilters),
            SortKey : SortKey.current,


        }
    });

    return response;
};

const stopFilter =async (
    min: number,
    max: number,
    ) => {
    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            minSize: min,
            maxSize: max,

        }
    });

    return response;
};

export const handleFilterChangeRange = async (
    key: keyof Airplane,
    Filters: MutableRefObject<FilterType>,
    setFilteredRows: Dispatch<SetStateAction<Airplane[]>>,
    SortKey: MutableRefObject<String>,
    SortDirection: MutableRefObject<String>
) => {
    const min = Filters.current.range.get(key)?.min;
    const max = Filters.current.range.get(key)?.max;
    const isFiltersRangeEmpty = Filters.current.range.size == 0

    try {
        const response = await startFilter(Filters.current,min!,max!,SortKey,SortDirection);

        const newRows = response.data;
        setFilteredRows(newRows.data);
        if (isFiltersRangeEmpty) {
            await stopFilter(min!,max!);
        }

    } catch (error) {
        console.error('Failed to fetch data', error);
    }
};
