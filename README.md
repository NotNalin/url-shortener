# URL Shortener

A modern, feature-rich URL shortening service built with Next.js, MongoDB, and Clerk authentication.

## Features

### Core URL Shortening

- **URL Shortening**: Create shortened versions of long URLs
- **Custom Slugs**: Define your own custom short URLs instead of random strings
- **Copy to Clipboard**: Easily copy shortened URLs with a single click
- **QR Code Generation**: Generate QR codes for your shortened URLs

### URL Management & Security

- **User Dashboard**: View, manage, and track all your shortened URLs
- **Password Protection**: Secure URLs with password protection
- **Link Expiration**: Set expiration dates for URLs (1 hour, 24 hours, 7 days, 30 days, or custom date)
- **Usage Limits**: Set maximum click limits for URLs
- **User Authentication**: Secure account creation and login via Clerk

### Comprehensive Analytics

- **Traffic Metrics**:

  - Total visits
  - Unique visitors
  - Total views
  - Time-based graphs with multiple range options (24h, 7d, 30d, 90d, all time)

- **Location Insights**:

  - IP address tracking for visitor identification
  - Country distribution
  - Region breakdown
  - City-level data

- **Traffic Sources**:

  - Referrer tracking
  - Direct vs indirect traffic

- **Device & Browser Metrics**:

  - Device types (mobile, tablet, desktop)
  - Operating systems
  - Browser information

- **Language & Timezone**:
  - Language preferences
  - Timezone distribution

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API routes (serverless functions)
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Styling**: TailwindCSS, Geist font
- **Analytics**: Custom analytics tracking system
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database
- Clerk account for authentication

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
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
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Creating Short URLs

1. Enter the original URL in the input field on the homepage
2. Optionally configure advanced settings (if authenticated):
   - Custom slug
   - Expiration time
   - Maximum number of clicks
   - Password protection
3. Click "Create Short URL"
4. Copy the shortened URL to your clipboard

### Managing Your URLs

1. Sign in to your account
2. Navigate to the dashboard to view all your URLs
3. For each URL, you can:
   - View click statistics
   - Copy the short URL
   - Delete the URL
   - View detailed analytics

### Password Protected URLs

1. When creating a URL, set a password
2. When someone visits the URL, they'll be prompted to enter the password
3. URL will only redirect to the original destination after correct password entry

### Analytics Dashboard

1. From your dashboard, click the analytics icon next to any URL
2. View comprehensive analytics including:
   - Traffic overview with total visits, unique visitors, and views
   - Time series graph showing visits over time
   - Geographic data including countries, regions, and cities
   - Referrer sources showing where your traffic comes from
   - Device and browser statistics
   - Language and timezone information
3. Use the time range selector to analyze data for different periods

## API Endpoints

### URL Shortening

- **POST** `/api/url` - Create a new shortened URL
  - Body: `{ originalUrl, customSlug?, expiryTime?, maxUses?, password? }`

### URL Retrieval

- **GET** `/api/url/:slug` - Get information about a URL
  - Response: `{ originalUrl, expiresAt?, currentClicks, maxClicks? }`

### Analytics

- **GET** `/api/analytics?slug=<slug>&timeRange=<range>` - Get analytics data for a specific URL
  - Query Parameters:
    - `slug`: The URL slug to get analytics for
    - `timeRange`: Time period for data (24h, 7d, 30d, 90d, all)
  - Response: Comprehensive analytics data object

## Database Schema

### URL Model

```typescript
{
  originalUrl: String,   // Original long URL
  slug: String,          // Short URL identifier
  createdAt: Date,       // Creation timestamp
  userId: String,        // User who created the URL (optional)
  expiresAt: Date,       // Expiration date (optional)
  maxClicks: Number,     // Maximum allowed clicks (optional)
  currentClicks: Number, // Current click count
  passwordHash: String,  // Hashed password for protection (optional)
}
```

### Analytics Model

```typescript
{
  urlId: String,         // Reference to the URL document
  slug: String,          // URL slug for easier querying
  timestamp: Date,       // When the visit occurred
  visitorId: String,     // Unique visitor identifier
  ipAddress: String,     // Visitor's IP address (for geolocation)
  referer: String,       // Where the visitor came from
  userAgent: {           // Browser and device data
    browser: String,
    device: String,
    os: String,
  },
  location: {            // Geographic data
    country: String,
    region: String,
    city: String,
  },
  language: String,      // Visitor's language
  timezone: String,      // Visitor's timezone
}
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set up the environment variables
4. Deploy

For other hosting providers, build the project and serve the output:

```bash
npm run build
npm run start
```

## Advanced Configuration

### Customizing Analytics

The analytics system can be extended by:

1. Adding more user agent tracking in `parseUserAgent` functions
2. Integrating with a geolocation service for more accurate location data based on IP addresses
3. Adding additional metrics to the `AnalyticsData` interface and corresponding components

### Security Considerations

- Passwords are hashed using bcrypt for secure storage
- Visitor IDs are generated using nanoid for privacy
- IP addresses are stored for analytics but should be handled in compliance with data privacy regulations
- User authentication is handled by Clerk for enterprise-grade security

## Future Enhancements

- Advanced QR code customization
- Built-in link preview capabilities
- Team collaboration features
- API key generation for programmatic access
- Webhook integrations for click notifications
- Enhanced geolocation with maps using IP address data
- Export analytics data to CSV/PDF

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Clerk](https://clerk.dev/) - Authentication
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
