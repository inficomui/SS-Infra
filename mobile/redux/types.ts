export interface User {
    id: number;
    name: string;
    mobile: string;
    role: 'Owner' | 'Operator' | 'Admin' | 'Driver';
    district: string;
    taluka: string;
    fixedMonthly?: string;
    perDayWise?: string;
    bonusAmount?: string;
    referralCode?: string | null;
    ownerId?: number | null;
    avatar?: string | null;
    licenseNumber?: string;
    assignedVehicle?: string;
    isActivePlan?: boolean;
    planDetails?: {
        status: string;
        end_date: string;
    };
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    data?: {
        token: string;
        user: User;
    };
    message?: string;
}
