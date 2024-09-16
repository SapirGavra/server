
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const loadMoreRows = async (numberRowsToLoad, data, isCurrentRowsAmount, currentData) => {
    const delay = 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    const newRows = data.slice(isCurrentRowsAmount, isCurrentRowsAmount + numberRowsToLoad);
    currentData = [...currentData, ...newRows];
    isCurrentRowsAmount += numberRowsToLoad;
    return { currentData, isCurrentRowsAmount };
};

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

export const filterDataByRange = (data, min, max) => {
    return data.filter(row => {
        const size = parseFloat(row.size);
        return size >= min && size <= max;
    });
};

export const filterDataByValue = (data,filterValuesCheckBox) => {
    return data.filter(row => {
        return Object.entries(filterValuesCheckBox).every(([key, values]) => {
            return values.length === 0 || values.includes(row[key]);
        });
    });

};