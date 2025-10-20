// src/types/property.ts
export interface Memory {
  _id?: string;
  photo?: string;
  memory: string;
  submitterName: string;
  contact?: string;
  residency?: {
    yearMovedIn?: number;
    yearMovedOut?: number;
    current: boolean;
  };
  submittedAt: string;
}

export interface Property {
  _id: string;
  address: string;
  yearBuilt?: number;
  lat: number;
  lng: number;
  memories: Memory[];
  createdAt: string;
  updatedAt: string;
}