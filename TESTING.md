# Analytics Testing Guide

This guide will help you test the analytics tracking functionality of the URL shortener application to ensure everything is working correctly.

## Prerequisites

1. Make sure your application is running locally or on a test server
2. Create a test URL with a known slug (e.g., "test123")
3. Have access to multiple browsers or devices for testing

## Manual Testing

### Basic Functionality

1. Visit your shortened URL: `http://localhost:3000/your-test-slug`
2. Check your analytics dashboard: `http://localhost:3000/dashboard/analytics/your-test-slug`
3. Verify that the visit count has increased
4. Verify that your browser and device type are correctly detected

### Testing Different Browsers

Visit your test URL from:

- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers (if available)

After each visit, check the dashboard to see if the browser is correctly detected.

### Testing Referrer Tracking

1. Create an HTML file with links to your test URL:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test Referrer</title>
  </head>
  <body>
    <h1>Test Referrer Links</h1>
    <a href="http://localhost:3000/your-test-slug">Click this link</a>
  </body>
</html>
```

2. Open this HTML file in your browser and click the link
3. Check the dashboard to see if the referrer is correctly tracked

### Testing Password Protection

If you've created a password-protected URL:

1. Visit the URL and enter the password
2. Check if the visit is tracked correctly
3. Try accessing the URL directly with the password in the URL:
   `http://localhost:3000/your-test-slug?key=your-password`
4. Verify that both methods of access are tracked properly

### Testing Geolocation

Since accurate geolocation testing requires different IP addresses:

1. If possible, test the URL from different networks (home, office, cellular data)
2. Use a VPN to simulate visits from different countries
3. Check the dashboard's world map to see if countries are displayed correctly

## Verification Checklist

Confirm that the following data points are correctly captured and displayed:

- [x] Total visit count
- [x] Unique visitor count
- [x] Browser detection
- [x] OS detection
- [x] Device type detection
- [x] Referrer sources
- [x] Geographic location (country, region, city)
- [x] Time series data (visits over time)
- [x] World map visualization

## Troubleshooting

If analytics aren't being properly recorded:

1. Check server logs for any errors related to analytics recording
2. Verify that MongoDB is properly connected and accessible
3. Check if your IP detection is working (may be different in development vs production)

## Performance Considerations

- After testing, check the server's response time for analytics heavy pages
- If the analytics dashboard is slow, consider implementing pagination or data aggregation
- Monitor your database size if you're tracking many URLs with high traffic

## Next Steps

After verifying that analytics tracking works correctly, consider:

1. Setting up monitoring for analytics failures
2. Implementing data export features
3. Adding more detailed analytics visualizations
4. Creating custom reports for frequent users
