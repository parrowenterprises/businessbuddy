# BusinessBuddy.online

[![CI](https://github.com/parrowenterprises/businessbuddy/actions/workflows/ci.yml/badge.svg)](https://github.com/parrowenterprises/businessbuddy/actions/workflows/ci.yml)

> **Development Status:** Early development - Not ready for production use

A comprehensive business management platform for side hustlers and small business owners. Manage customers, services, quotes, jobs, and invoices all in one place.

## Features

- 🔐 Secure authentication with Supabase
- 👥 Customer management
- 💼 Service catalog
- 📝 Quote generation
- 📅 Job scheduling
- 💰 Invoice management
- 📊 Business analytics dashboard

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentication & Database)
- Stripe (Payments)

## Development

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Setup

1. Clone the repository:
```bash
git clone https://github.com/parrowenterprises/businessbuddy.git
cd businessbuddy
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests (when configured)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow our code of conduct.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
