export type MachineType = 
  | 'JCB' 
  | 'Poclain' 
  | 'Crane' 
  | 'Tractor' 
  | 'Dumper' 
  | 'Roller' 
  | 'Concrete Mixer' 
  | 'Hydra' 
  | 'Excavator' 
  | 'Loader' 
  | 'Bobcat' 
  | 'Dozer' 
  | 'Tipper' 
  | 'Water Tanker' 
  | 'Road Roller' 
  | 'Other';

export type RentType = 'Hourly' | 'Daily' | 'Monthly';
export type AvailabilityStatus = 'Available' | 'Not Available';
export type UserRole = 'User' | 'Owner' | 'Operator' | 'Driver' | 'Admin';

export interface Machine {
  id: string;
  machineName: string;
  machineType: MachineType;
  description: string;
  images: string[];
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  operatorName?: string;
  operatorPhone?: string;
  driverName?: string;
  driverPhone?: string;
  district: string;
  subDistrict: string;
  village: string;
  rentType: RentType;
  rentPrice: number;
  availability: AvailabilityStatus;
  verified: boolean;
  createdAt: string;
  serviceArea?: string;
  workingHours?: string;
}

export interface District {
  name: string;
  subDistricts: SubDistrict[];
}

export interface SubDistrict {
  name: string;
  machineCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  photo?: string;
  experience?: string;
  skills?: string[];
  location?: {
    district: string;
    subDistrict: string;
  };
}

export interface Enquiry {
  id: string;
  machineId: string;
  userId: string;
  userName: string;
  userPhone: string;
  message: string;
  status: 'Pending' | 'Contacted' | 'Closed';
  createdAt: string;
}
