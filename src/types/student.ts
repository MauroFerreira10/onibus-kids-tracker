
// Define student types

export type StudentBoardingStatus = 'waiting' | 'boarded' | 'absent' | 'present_at_stop';

export interface StudentWithStatus {
  id: string;
  name: string;
  status: StudentBoardingStatus;
  grade?: string;
  classroom?: string;
  pickupAddress?: string;
  stopId?: string;
  [key: string]: any; // Allow additional properties
}
