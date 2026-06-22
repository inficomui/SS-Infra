import { Machine, District, MachineType } from '../types';

export const CATEGORIES: MachineType[] = [
  'JCB', 'Poclain', 'Crane', 'Tractor', 'Dumper', 'Roller', 
  'Concrete Mixer', 'Hydra', 'Excavator', 'Loader', 
  'Bobcat', 'Dozer', 'Tipper', 'Water Tanker', 'Road Roller'
];

export const DISTRICTS: District[] = [
  {
    name: 'Aurangabad',
    subDistricts: [
      { name: 'Gangapur', machineCount: 25 },
      { name: 'Paithan', machineCount: 18 },
      { name: 'Sillod', machineCount: 12 },
      { name: 'Kannad', machineCount: 15 },
      { name: 'Vaijapur', machineCount: 10 }
    ]
  },
  {
    name: 'Pune',
    subDistricts: [
      { name: 'Haveli', machineCount: 45 },
      { name: 'Mulshi', machineCount: 30 },
      { name: 'Khed', machineCount: 22 },
      { name: 'Baramati', machineCount: 18 }
    ]
  },
  {
    name: 'Mumbai',
    subDistricts: [
      { name: 'Andheri', machineCount: 12 },
      { name: 'Borivali', machineCount: 8 },
      { name: 'Kurla', machineCount: 15 }
    ]
  }
];

export const DUMMY_MACHINES: Machine[] = [
  {
    id: '1',
    machineName: 'JCB 3DX Eco',
    machineType: 'JCB',
    description: 'High performance backhoe loader for all construction needs.',
    images: ['https://images.unsplash.com/photo-1579412690850-bd41ec0ca047?q=80&w=1000'],
    ownerName: 'Rahul Sharma',
    ownerPhone: '+919876543210',
    ownerWhatsapp: '+919876543210',
    operatorName: 'Amit Kumar',
    operatorPhone: '+919876543211',
    district: 'Aurangabad',
    subDistrict: 'Gangapur',
    village: 'Waluj',
    rentType: 'Hourly',
    rentPrice: 800,
    availability: 'Available',
    verified: true,
    createdAt: new Date().toISOString(),
    serviceArea: '20km radius',
    workingHours: '8 AM - 6 PM'
  },
  {
    id: '2',
    machineName: 'Tata Hitachi ZAXIS 210',
    machineType: 'Excavator',
    description: 'Heavy duty excavator for large scale digging and demolition.',
    images: ['https://images.unsplash.com/photo-1541625602330-2277a1cd43a7?q=80&w=1000'],
    ownerName: 'Suresh Patil',
    ownerPhone: '+919876543220',
    ownerWhatsapp: '+919876543220',
    operatorName: 'Vijay Singh',
    operatorPhone: '+919876543221',
    district: 'Pune',
    subDistrict: 'Haveli',
    village: 'Wagholi',
    rentType: 'Daily',
    rentPrice: 15000,
    availability: 'Available',
    verified: true,
    createdAt: new Date().toISOString(),
    serviceArea: 'Pune District',
    workingHours: '7 AM - 7 PM'
  },
  {
    id: '3',
    machineName: 'Action Construction Equipment Hydra 12',
    machineType: 'Hydra',
    description: 'Versatile mobile crane for lifting and shifting operations.',
    images: ['https://images.unsplash.com/photo-1570535359281-229ef58b9f71?q=80&w=1000'],
    ownerName: 'Mahesh Deshmukh',
    ownerPhone: '+919876543230',
    ownerWhatsapp: '+919876543230',
    driverName: 'Karan Mehra',
    driverPhone: '+919876543231',
    district: 'Aurangabad',
    subDistrict: 'Paithan',
    village: 'Bidkin',
    rentType: 'Hourly',
    rentPrice: 1200,
    availability: 'Not Available',
    verified: false,
    createdAt: new Date().toISOString()
  }
];
