
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const applySorting = (data, sortKey, sortDirection) => {
    data.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
}
export let currentRowsFilters = [];

export const filterDataByRange = (currentRowsFilters, min, max) => {
    const filteredData = currentRowsFilters.filter(row => {
        const size = parseFloat(row.size);
        return size >= min && size <= max;
    });

    // Update currentRowsFilters with the filtered data
    currentRowsFilters = filteredData;

    return filteredData;
};

console.log('currentRowsFilters-----------------------',currentRowsFilters)
export const filterDataByValue = (currentRowsFilters, filterValues) => {
    return currentRowsFilters.filter(row => {
        return Object.entries(filterValues).every(([key, values]) => {
            return values.length === 0 || values.includes(row[key]);
        });
    });
};