
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
