import {Airplane} from "./Airplane";

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
