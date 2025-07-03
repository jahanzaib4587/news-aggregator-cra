# API Keys Setup Guide

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

## Demo Mode

If you want to test the UI without API keys, the application will show appropriate error messages but the interface will still be functional. 