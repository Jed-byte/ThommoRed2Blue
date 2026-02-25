# Step-by-Step Reserved VM Deployment Setup Guide

## ✅ BUILD COMMANDS VERIFIED

Your build commands are correctly configured:
- **Build Command**: `npm run build` ✅ 
- **Run Command**: `npm run start` ✅

These are set in your `.replit` file and should automatically transfer to your deployment.

## 📝 ENVIRONMENT VARIABLES SETUP

I can see your development environment has all required variables. Now you need to copy them to your deployment.

### **HOW TO FIND ENVIRONMENT VARIABLES IN DEPLOYMENT:**

#### Step 1: Access Deployment Settings
1. Click the **"Tools"** panel on the left side of Replit
2. Click **"Deployments"** 
3. Find your Reserved VM deployment
4. Click the **"Settings"** tab (not "Overview" or "Logs")

#### Step 2: Look for Environment Variables Section
In the Settings tab, scroll down to find:
- **"Environment Variables"** or 
- **"Secrets"** or
- **"Environment"** section

#### Step 3: Add Required Variables
Copy these values from your development environment:

**Required Environment Variables:**
```
DATABASE_URL=[Your Neon database URL - starts with postgresql://]
GEMINI_API_KEY=[Your Google Gemini API key]
STRIPE_SECRET_KEY=[Your Stripe secret key - starts with sk_live or sk_test]
VITE_STRIPE_PUBLIC_KEY=[Your Stripe public key - starts with pk_live or pk_test]  
SESSION_SECRET=[Any secure random string - can be anything like "my-secret-key-12345"]
NODE_ENV=production
```

### **WHERE TO GET THE VALUES:**

1. **DATABASE_URL**: From your Neon dashboard or current development environment
2. **GEMINI_API_KEY**: From Google AI Studio or your Google Cloud Console
3. **STRIPE_SECRET_KEY**: From your Stripe Dashboard → API keys
4. **VITE_STRIPE_PUBLIC_KEY**: From your Stripe Dashboard → API keys  
5. **SESSION_SECRET**: Create any secure random string (e.g., "red2blue-session-secret-2025")
6. **NODE_ENV**: Set to "production"

## 🔍 IF YOU CAN'T FIND ENVIRONMENT VARIABLES SECTION:

Try these locations in your Deployment Settings:
- Look for a **"Configuration"** tab
- Check for **"Advanced Settings"** 
- Look for **"Runtime Environment"**
- Check if there's a **"Variables"** section

## 🚀 AFTER ADDING ENVIRONMENT VARIABLES:

1. **Save the settings**
2. Click **"Deploy"** to redeploy
3. Wait 3-5 minutes for Reserved VM to restart
4. Check your app at: https://performance-ai-coach-markesthompson.replit.app

## 📞 IF YOU STILL CAN'T FIND IT:

Take a screenshot of your Deployment Settings page and I can help you locate exactly where to add the environment variables.

The deployment configuration is correct - we just need to get the environment variables properly configured in the Reserved VM deployment settings.