import value from "*.json";

export interface sortConfigType { key: keyof Airplane; direction: 'asc' | 'desc' }

export interface RangeFilter {
    key: string
    min: string;
    max: string;
}

export interface CheckboxFilter {
    key: string;
    values: string;
}

export interface SortFilter {
    direction: 'asc' | 'desc'; // Assuming direction can only be 'asc' or 'desc'
    key: string;
}
export interface FilterType {
    range: RangeFilter;
    checkbox: CheckboxFilter;
    sort: SortFilter;
}

export interface Airplane {
    id: string;
    type: string;
    capacity: number;
    size: string;
}
export interface Column  {
    key: keyof Airplane;
    label: string;
}
export const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'size', label: 'Size' }
];
