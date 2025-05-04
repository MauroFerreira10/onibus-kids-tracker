
// Define student types

export type StudentBoardingStatus = 'waiting' | 'boarded' | 'absent';

export interface StudentWithStatus {
  id: string;
  name: string;
  status: StudentBoardingStatus;
  grade?: string;
  classroom?: string;
  pickupAddress?: string;
  [key: string]: any; // Allow additional properties
}
