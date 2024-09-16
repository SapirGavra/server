import value from "*.json";

export interface sortConfigType { key: keyof Airplane; direction: 'asc' | 'desc' }

export interface FilterType {
    range: Map<keyof Airplane, { min: number; max: number }>;
    checkbox: Map<keyof Airplane, Set<string | number>>;
    sort: Map<keyof Airplane, {direction: 'asc' | 'desc'}>;
}

export interface Airplane {
    id: string;
    type: string;
    capacity: number;
    size: string;
}
export interface Column  {
    key: keyof Airplane ;
    label: string;
}
export const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'size', label: 'Size' }
];
