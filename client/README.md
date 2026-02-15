# SS Infra Admin Panel

This is the Admin Panel for SS Infra, built with Next.js, Redux Toolkit, and Tailwind CSS.

## Features

- **Authentication**: Secure admin login and password management.
- **Dashboard**: Overview of system statistics (users, recharges, activity).
- **User Management**: View and manage owners and operators.
- **Reports**: Detailed recharge reports.
- **Settings**: Change password and other configurations.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **State Management**: Redux Toolkit (RTK) & RTK Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Authentication Persistence**: JS Cookie

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the application**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(admin)/`: Protected admin routes (Dashboard, Settings, etc.).
  - `(auth)/`: Authentication routes (Login).
- `lib/`: Shared libraries and utilities.
  - `store/`: Redux store configuration.
  - `features/`: Redux slices and API definitions (Auth, etc.).
- `components/`: Reusable UI components.

## API Integration

The application connects to the backend API at `http://localhost:5000/api/v1`.
Configure the `baseUrl` in `lib/features/auth/authApi.ts` if needed.
