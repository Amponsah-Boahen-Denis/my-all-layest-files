# 🌍 Environment Configuration Guide

## 🔑 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Google API Configuration
```env
# Frontend (public) - for geolocation and autocomplete
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here

# Backend (private) - for Places API searches
GOOGLE_API_KEY=your_actual_api_key_here
```

### MongoDB Configuration
```env
MONGODB_URI=mongodb://localhost:27017/store-locator
```

### Next.js Configuration
```env
NODE_ENV=development
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Optional Environment Variables

### Analytics and Monitoring
```env
GOOGLE_ANALYTICS_ID=your_ga_id_here
SENTRY_DSN=your_sentry_dsn_here
```

### Email Service (for notifications)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### Redis (for production rate limiting)
```env
REDIS_URL=redis://localhost:6379
```

### External Services
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

## 📋 Complete Example

Here's a complete `.env.local` file example:

```env
# Google API Configuration
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyB...your_actual_key_here
GOOGLE_API_KEY=AIzaSyB...your_actual_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/store-locator

# Next.js Configuration
NODE_ENV=development
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## ⚠️ Important Notes

1. **Never commit `.env.local` to version control**
2. **Restart your development server after changing environment variables**
3. **Use different API keys for development and production**
4. **Set proper API key restrictions in Google Cloud Console**

## 🔒 Security Best Practices

1. **API Key Restrictions**: Limit your Google API key to specific domains
2. **Environment Separation**: Use different keys for dev/staging/production
3. **Rate Limiting**: Monitor API usage to prevent abuse
4. **Regular Rotation**: Rotate API keys periodically

## 🚨 Troubleshooting

### "Google API key is missing" error
- Check that `.env.local` exists in project root
- Verify the API key is correct
- Restart your development server
- Check browser console for any errors

### "API quota exceeded" error
- Check your Google Cloud Console billing
- Verify API quotas and limits
- Consider implementing caching strategies

### "Geolocation not supported" error
- Use HTTPS in production (required for geolocation)
- Check browser permissions for location access
- Ensure Google Maps JavaScript API is enabled
