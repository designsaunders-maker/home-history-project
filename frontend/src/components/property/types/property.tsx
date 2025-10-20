// src/types/property.ts
export interface Property {
  id: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  claimedBy: {
    userId: string;
    verificationStatus: 'pending' | 'basic' | 'enhanced';
    claimedAt: string;
  }[];
  verificationDocuments?: {
    id: string;
    type: 'utility_bill' | 'tax_document' | 'lease' | 'deed' | 'other';
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
  }[];
  timeline?: {
    id: string;
    userId: string;
    type: 'residency' | 'event' | 'photo' | 'story';
    content: string;
    date: string;
    visibility: 'public' | 'verified_only' | 'private';
  }[];
  metadata?: {
    yearBuilt?: number;
    propertyType?: 'single_family' | 'multi_family' | 'apartment' | 'commercial' | 'other';
    historicalDetails?: string;
  };
}