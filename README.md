# Full-Stack Investment Platform

A complete investment platform with user authentication, product plans, daily income, withdrawals, and recharges.

## Features

### 1. User Authentication
- Simple Registration & Login with name, mobile number, and password
- Secure Login with password hashing and JWT tokens
- One-time registration with persistent login

### 2. Product Plans
- Multiple investment plans with different pricing and returns
- Automatic balance checking before purchase
- One plan per month rule enforcement

### 3. Daily Income
- Automatic daily income credits to user wallets
- Duplicate prevention mechanism

### 4. Withdrawals
- Easy withdrawal process with bank or UPI options
- One withdrawal every 24 hours rule
- Automatic 5% GST deduction

### 5. Recharges
- UPI payment option with QR code
- UPI ID copying functionality
- Payment UTR submission for admin approval

### 6. Sharing System
- Referral link generation and copying

### 7. User Dashboard
- Clean overview with wallet balance, investments, and withdrawals
- Real-time status tracking for active plans and transactions

### 8. Marketing Features
- Fake withdrawal popups for trust building
- Dynamic marketing statistics
- Anniversary achievement badges

### 9. Admin Panel
- Recharge and withdrawal approval
- User balance adjustments
- Transaction management

### 10. Mobile-First Premium UI
- Responsive design for all devices
- Clean, minimalistic, and modern interface
- Smooth animations and intuitive navigation

## Tech Stack

- Frontend: React.js (Hosted on Netlify)
- Backend: Node.js + Express.js (Hosted on Render)
- Database: Supabase (PostgreSQL)
- Authentication: JWT

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/data` - Get user data (protected)

### Product Plans
- `GET /api/product-plans` - Get available investment plans
- `POST /api/purchase-plan` - Purchase an investment plan

### Transactions
- `POST /api/withdraw` - Request withdrawal
- `GET /api/withdrawals` - Get user withdrawals
- `POST /api/recharge` - Request recharge
- `GET /api/recharges` - Get user recharges

### Investments
- `GET /api/investments` - Get user investments

### Marketing
- `GET /api/marketing-stats` - Get marketing statistics
- `GET /api/fake-withdrawal` - Generate fake withdrawal for popup
- `GET /api/upi-id` - Get UPI ID for payments
- `GET /api/referral-link` - Generate referral link

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_api_key
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/build`

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Create `.env` file in backend directory with your credentials
4. Start backend server:
   ```
   cd backend && npm start
   ```
5. Start frontend development server:
   ```
   cd frontend && npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.