import { Airplane } from "../types/Airplane";

interface SortConfig {
    key: keyof Airplane;
    direction: 'asc' | 'desc';
}

export const sortRows = (rows: Airplane[], key: keyof Airplane, direction: 'asc' | 'desc') => {
    return [...rows].sort((a, b) => {
        if (a[key] < b[key]) {
            return direction === 'asc' ? -1 : 1;
        }
        if (a[key] > b[key]) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

export const createSortHandler = (
    key: keyof Airplane,
    sortConfig: SortConfig | null,
    setSortConfig: (config: SortConfig) => void,
    rows: Airplane[],
    setRows: (rows: Airplane[]) => void,
    currentIndex: number,
    sortLabelRef: React.MutableRefObject<boolean>
) => () => {
    const direction: 'asc' | 'desc' = sortConfig && sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    if (!sortLabelRef.current) {
        console.log('sortLabel1:', sortLabelRef.current)
        sortLabelRef.current = true;
        console.log('sortLabel2:', sortLabelRef.current)

        const sortedRows = sortRows(rows, key, direction);
        setRows(sortedRows.slice(0, currentIndex));
        sortLabelRef.current = false;
        console.log('sortLabel3:', sortLabelRef.current)
    }
};
