# News Aggregator Setup Guide

This guide will walk you through setting up the News Aggregator application both locally and for deployment.

🔗 **Live Demo**: [https://news-aggregator-cra-54sy.vercel.app/](https://news-aggregator-cra-54sy.vercel.app/)

## Table of Contents

1. [API Keys Setup](#api-keys-setup)
2. [Local Development Setup](#local-development-setup)
3. [Deployment Setup](#deployment-setup)
4. [Troubleshooting](#troubleshooting)
5. [Testing Without API Keys](#testing-without-api-keys)

## API Keys Setup

To run this news aggregator application, you need to obtain API keys from three news sources. Here's how to get them:

## 1. NewsAPI Key

1. Visit [https://newsapi.org/](https://newsapi.org/)
2. Click on "Get API Key"
3. Sign up for a free account
4. Your API key will be displayed in your account dashboard
5. Free tier includes 1,000 requests per day

## 2. The Guardian API Key

1. Visit [https://open-platform.theguardian.com/](https://open-platform.theguardian.com/)
2. Click on "Register for a developer key"
3. Fill out the registration form
4. Check your email for the API key
5. Free tier includes 5,000 requests per day

## 3. The New York Times API Key

1. Visit [https://developer.nytimes.com/](https://developer.nytimes.com/)
2. Click on "Sign Up"
3. Create an account
4. Go to "Apps" and create a new app
5. Enable the "Article Search API"
6. Your API key will be shown in the app details
7. Free tier includes 1,000 requests per day

## Setting Up Environment Variables

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Add your API keys to the `.env` file:
```env
REACT_APP_NEWSAPI_KEY=your_actual_newsapi_key
REACT_APP_GUARDIAN_KEY=your_actual_guardian_key
REACT_APP_NYTIMES_KEY=your_actual_nytimes_key
```

3. Make sure the `.env` file is in your `.gitignore` (it should be by default)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd news-aggregator-cra
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Follow the steps in the [Setting Up Environment Variables](#setting-up-environment-variables) section above.

### 4. Start the Development Server

```bash
npm start
# or
yarn start
# or
pnpm start
```

The application will open at `http://localhost:3000`

## Deployment Setup

### Option 1: Vercel Deployment (Recommended)

1. **Fork this repository** to your GitHub account

2. **Sign up for Vercel** at [vercel.com](https://vercel.com)

3. **Import your forked repository**:
   - Click "New Project" in Vercel dashboard
   - Select your forked repository
   - Vercel will automatically detect it's a Create React App

4. **Configure Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add your API keys:
     ```
     REACT_APP_NEWSAPI_KEY=your_newsapi_key
     REACT_APP_GUARDIAN_KEY=your_guardian_key
     REACT_APP_NYTIMES_KEY=your_nytimes_key
     ```

5. **Deploy** - Click "Deploy" and Vercel will build and deploy your app

6. **Access your app** at the provided URL (e.g., `https://your-project.vercel.app`)

### Option 2: Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t news-aggregator .
   ```

2. **Run with Docker Compose** (recommended):
   ```bash
   docker-compose up -d
   ```

3. **Or run with Docker directly**:
   ```bash
   docker run -p 3000:80 --env-file .env news-aggregator
   ```

### Option 3: Static Hosting (Netlify, GitHub Pages, etc.)

1. **Build the production bundle**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your preferred static hosting service

3. **Configure environment variables** in your hosting service's dashboard

## Testing Without API Keys

The application includes a **Demo Mode** that activates when no valid API keys are detected. This mode:

- Displays mock news articles to showcase the UI
- Demonstrates all features (search, filtering, infinite scroll)
- Shows appropriate messages about API configuration
- Allows full interaction with the interface

To test the live demo without API keys, visit: [https://news-aggregator-cra-54sy.vercel.app/](https://news-aggregator-cra-54sy.vercel.app/)

## Testing Your Setup

Run the development server:
```bash
npm run dev
```

If your API keys are set up correctly, you should see news articles loading on the homepage.

## Troubleshooting

- **No articles loading**: Check browser console for API errors
- **401 Unauthorized**: Verify your API keys are correct
- **Rate limit exceeded**: You've hit the daily limit for free tier

## Common Setup Issues

### Build Errors

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables on Windows

On Windows, you might need to use:
```env
set REACT_APP_NEWSAPI_KEY=your_key
# or in PowerShell
$env:REACT_APP_NEWSAPI_KEY="your_key"
```

### CORS Issues

If you encounter CORS errors:
- Ensure you're using the correct API endpoints
- Check if your API keys have the necessary permissions
- Consider using a proxy for development

### Deployment Environment Variables

When deploying, make sure to:
- Add environment variables in your hosting platform's dashboard
- Use the exact same variable names as in `.env`
- Rebuild/redeploy after adding variables

## Demo Mode

If you want to test the UI without API keys, the application will show appropriate error messages but the interface will still be functional. 

## Need Help?

- Check the [main README](README.md) for detailed feature information
- Visit the [live demo](https://news-aggregator-cra-54sy.vercel.app/) to see the app in action
- Review the API documentation for each news service
- Open an issue if you encounter persistent problems 