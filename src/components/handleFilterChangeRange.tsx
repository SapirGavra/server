import axios from "axios";
import { rangeType, Airplane } from "../Utils/types";
import { MutableRefObject } from "react";

const startFilter = async (
    isFilterModeRangeRef: MutableRefObject<boolean>,
    sizeRange: rangeType,
    selectedKey: keyof Airplane,
) => {

    isFilterModeRangeRef.current = true;

    const min = sizeRange.min;
    const max = sizeRange.max;


    // Send GET request with filtering parameters
    const response = await axios.get('http://localhost:3000/airplanes', {
        params: {
            minSize: min,
            maxSize: max,
            keySize: selectedKey,
            isFilterModeRangeRef: isFilterModeRangeRef.current,
        }
    });

    return response;
};


const stopFilter = async (isFilterModeRangeRef: MutableRefObject<boolean>) => {
    isFilterModeRangeRef.current = false;
    await axios.get('http://localhost:3000/airplanes', {
        params: {
            isFilterModeRangeRef: isFilterModeRangeRef.current,
        }
    });

};

// Define handleFilterChangeRange to handle filtering logic in the client
export const handleFilterChangeRange = async (
    sizeRange: rangeType,
    selectedKey: keyof Airplane,
    isFilterModeRangeRef: React.MutableRefObject<boolean>,
    setFilteredRows: React.Dispatch<React.SetStateAction<Airplane[]>>
) => {
    const min = sizeRange.min;
    const max = sizeRange.max;

    const isFiltersRangeEmpty = (min === '' && max === '');


    try {
        const response = await startFilter(isFilterModeRangeRef, sizeRange, selectedKey);

        const newRows = response.data;
        setFilteredRows(newRows.data);
        // if (isFiltersRangeEmpty) {
        //     await stopFilter(isFilterModeRangeRef);
        // }

    } catch (error) {
        console.error('Failed to fetch data', error);
    }
};
