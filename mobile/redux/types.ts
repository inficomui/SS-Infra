export interface User {
    id: number;
    name: string;
    mobile: string;
    role: 'Owner' | 'Operator' | 'Admin';
    district: string;
    taluka: string;
    fixedMonthly?: string;
    perDayWise?: string;
    bonusAmount?: string;
    referralCode?: string | null;
    ownerId?: number | null;
    avatar?: string | null;
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
