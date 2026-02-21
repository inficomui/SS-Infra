# SS-Infra Portfolio & Client API Documentation

This document outlines the API endpoints required for the SS-Infra Dynamic Portfolio, including client-side discovery, authentication, and operator booking.

## 1. Authentication
Endpoints for client login (for booking and enquiries).

- **POST** `/api/auth/send-otp`
  - Purpose: Send OTP to client's phone number.
  - Body: `{ "phone": "string" }`
- **POST** `/api/auth/verify-otp`
  - Purpose: Verify OTP and login.
  - Body: `{ "phone": "string", "otp": "string" }`

## 2. Discovery (Owners & Operators)
Endpoints for clients to see and search for service providers.

- **GET** `/api/discovery/owners`
  - Purpose: Fetch list of registered infrastructure business owners.
  - Query Params: `?page=1&limit=10&location=string`
- **GET** `/api/discovery/operators`
  - Purpose: Fetch list of available operators.
  - Query Params: `?page=1&limit=10&status=available`
- **GET** `/api/discovery/near-me`
  - Purpose: Find operators closest to the client's current location.
  - Query Params: `?lat=number&lng=number&radius=km`

## 3. Client Enquiries & Bookings
Endpoints for clients to book operators or send enquiries to owners.

- **POST** `/api/enquiry/create`
  - Purpose: Submit a general business enquiry.
  - Body: `{ "name": "string", "phone": "string", "company": "string", "message": "string" }`
- **POST** `/api/booking/request`
  - Purpose: Request a specific operator for a job.
  - Body: `{ "operatorId": "string", "startTime": "datetime", "location": "string", "workType": "string" }`

## 4. Wallet & Payments (Client Side)
- **GET** `/api/client/history`
  - Purpose: View previous bookings and payment history.

## 5. Machine/Fleet Info
- **GET** `/api/fleet/details/:id`
  - Purpose: View details of a specific machine owned by an owner.
