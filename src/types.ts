import { Timestamp } from './firebase';

export interface VisitRecord {
  date: string;
  reason: string;
  notes: string;
}

export interface Patient {
  id?: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  photoUrl?: string; // Added photoUrl
  bloodType?: string;
  department?: string;
  attendingPhysician?: string;
  professor?: string;
  admissionDate?: Timestamp;
  dischargeDate?: Timestamp;
  roundingTime?: string;
  currentStatus?: string;
  specialNotes?: string;
  ward?: string;
  institutionName?: string;
  transferReason?: string;
  otherRecords?: string;
  visitHistory?: VisitRecord[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  uid: string;
}

export type TabType = 'bed' | 'registration' | 'admission' | 'other' | 'settings';
