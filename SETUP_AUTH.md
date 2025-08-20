# Authentication Setup Guide

This guide will help you set up user authentication and persistent history storage for your Sentiment Analyzer app.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set a username and password
   - Give "Read and write to any database" permissions

## Step 2: OAuth Provider Setup

### Google OAuth (Recommended)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

4. **Copy Credentials**
   - Copy the Client ID and Client Secret

### GitHub OAuth (Alternative)

1. **Create GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "Sentiment Analyzer"
     - Homepage URL: `http://localhost:3000` (development)
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

2. **Copy Credentials**
   - Copy the Client ID and Client Secret

## Step 3: Environment Variables

Update your `.env.local` file with the following variables:

```env
# Hugging Face Inference API
HUGGING_FACE_API_KEY=your_api_key_here

# Next.js
NEXT_PUBLIC_APP_NAME=Sentiment Analyzer

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sentiscope?retryWrites=true&w=majority
MONGODB_DB=sentiscope

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Step 4: Database Collections

MongoDB Atlas will automatically create the following collections when users sign in:

- `users` - User accounts (managed by NextAuth)
- `accounts` - OAuth account links (managed by NextAuth)
- `sessions` - User sessions (managed by NextAuth)
- `verification_tokens` - Email verification (managed by NextAuth)
- `analyses` - User analysis history (created by our app)
- `profiles` - User profiles with analysis counts (created by our app)

## Step 5: Test the Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Go to `http://localhost:3000`
   - Click "Sign In" in the header
   - Try signing in with Google or GitHub
   - Verify you're redirected back to the home page

3. **Test Analysis History**
   - Sign in to your account
   - Perform a sentiment analysis
   - Check that the analysis appears in the dashboard
   - Verify the data is saved to MongoDB

## Step 6: Production Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add authentication and database integration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update OAuth Redirect URIs**
   - Update Google OAuth redirect URI to your production domain
   - Update GitHub OAuth callback URL to your production domain

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production domain)
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Check that your OAuth redirect URIs match exactly
   - Include both development and production URLs

2. **MongoDB connection errors**
   - Verify your connection string is correct
   - Check that your IP is whitelisted in MongoDB Atlas
   - Ensure your database user has proper permissions

3. **NextAuth secret errors**
   - Generate a new secret using the openssl command
   - Make sure it's at least 32 characters long

4. **TypeScript errors**
   - Run `npm run build` to check for compilation errors
   - Make sure all environment variables are properly typed

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
DEBUG=next-auth:*
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different secrets for development and production

2. **Database Security**
   - Use strong passwords for database users
   - Enable IP whitelisting in MongoDB Atlas
   - Regularly rotate database credentials

3. **OAuth Security**
   - Keep OAuth client secrets secure
   - Use HTTPS in production
   - Regularly review OAuth app permissions

## Next Steps

After setting up authentication, you can:

1. **Add more OAuth providers** (Twitter, Discord, etc.)
2. **Implement email verification**
3. **Add user profile management**
4. **Create admin dashboard**
5. **Add data export functionality**
6. **Implement rate limiting**

## Support

If you encounter issues:

1. Check the [NextAuth.js documentation](https://next-auth.js.org/)
2. Review [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/)
3. Check the browser console for error messages
4. Verify all environment variables are set correctly
