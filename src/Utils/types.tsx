export interface sortConfigType { key: keyof Airplane; direction: 'asc' | 'desc' }

export interface Airplane {
    id: string;
    type: string;
    capacity: number;
    size: number;
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
