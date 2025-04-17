# URL Shortener

A modern, feature-rich URL shortening service built with Next.js, MongoDB, and Clerk authentication.

## Features

### URL Management & Features

- URL Shortening

  - Create shortened versions of long URLs
  - Personalize shortened URLs with custom slugs
  - One-click copy functionality
  - QR code generation for each shortened URL
  - Password protection for sensitive links
  - Customizable expiration settings:
    - Quick options (1h, 24h, 7d, 30d)
    - Custom date selection
  - Maximum click/usage limits
  - Secure user authentication via Clerk
  - Management
    - User-friendly dashboard interface
    - Track and manage all created URLs


### Analytics Dashboard

- Comprehensive traffic metrics:
  - Total visits
  - Unique visitors
  - Total views
  - Time-based analysis (24h, 7d, 30d, 90d, all time)
- Geographic insights:
  - Country distribution
  - Region breakdown
- Device & browser statistics

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: TailwindCSS 4
- **Backend**: Next.js API routes (serverless)
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB database
- Clerk account

### Environment Setup

Create a `.env` file:

```
MONGODB_URI=your_mongodb_connection_string

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/NotNalin/url-shortener.git
cd url-shortener
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Optimized for Vercel deployment:

1. Push to GitHub
2. Import in Vercel
3. Configure environment variables
4. Deploy

For other platforms:

```bash
npm run build
npm run start
```

## License

MIT License

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Mongoose](https://mongoosejs.com/)
