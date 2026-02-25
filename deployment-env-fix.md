# URGENT: Reserved VM Environment Variables Fix

## 🚨 ISSUE CONFIRMED

The deployment is failing because environment variables are NOT being transferred automatically to Reserved VM. We need to manually configure them.

## 🔍 EXACT STEPS TO FIND ENVIRONMENT VARIABLES

Since you can't find the Environment Variables section, try these specific locations:

### Method 1: Deployment Secrets
1. Go to **Deployments** tab
2. Click on your Reserved VM deployment
3. Look for **"Secrets"** tab (might be next to Settings)
4. Add environment variables there

### Method 2: Advanced Settings
1. In Deployments → Settings
2. Scroll down to find **"Advanced"** or **"Configuration"**
3. Look for **"Runtime Environment"** section
4. Add variables there

### Method 3: Machine Configuration
1. In Deployment Settings
2. Look for **"Machine Configuration"** or **"VM Settings"**
3. Find **"Environment"** subsection

## 📋 EXACT VARIABLES TO ADD

Copy these exactly (replace ... with your actual values):

```
DATABASE_URL=postgresql://neondb_owner:...@ep-...amazonaws.com/neondb
GEMINI_API_KEY=AIzaSyC7xa...
STRIPE_SECRET_KEY=sk_test_51...
VITE_STRIPE_PUBLIC_KEY=pk_live_51...
SESSION_SECRET=red2blue-session-secret-2025
NODE_ENV=production
```

## 🚀 ALTERNATIVE: CHECK DEPLOYMENT LOGS

1. Go to Deployments → **"Logs"** tab
2. Look for error messages like:
   - "DATABASE_URL is not defined"
   - "Connection failed"
   - "Environment variable missing"

The logs will tell us exactly which variable is missing.

## 📞 IMMEDIATE ACTION NEEDED

If you still can't find where to add environment variables:

1. **Take a screenshot** of your entire Deployment Settings page
2. **Check the Logs tab** for specific error messages
3. Look for any **"Configure"** or **"Environment"** buttons

The server is working perfectly - this is purely a deployment configuration issue that we can solve once we locate the right settings panel.