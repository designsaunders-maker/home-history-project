#!/bin/bash

# Vercel Deployment Script for Home History Project
# Run this script after logging in to Vercel

echo "================================================"
echo "Vercel Deployment Setup for Home History Project"
echo "================================================"
echo ""

# Step 1: Verify Vercel CLI is installed
echo "Step 1: Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
else
    echo "✓ Vercel CLI already installed"
fi
echo ""

# Step 2: Login (manual step)
echo "Step 2: Login to Vercel"
echo "Run: vercel login"
echo "Then follow the browser prompts to authenticate"
echo ""
read -p "Press ENTER when you've completed login..."
echo ""

# Step 3: Link project
echo "Step 3: Linking project to Vercel..."
cd frontend
vercel link
echo ""

# Step 4: Add environment variables
echo "Step 4: Adding environment variables..."
echo ""

echo "Adding REACT_APP_GOOGLE_MAPS_API_KEY..."
echo "AIzaSyCFpFTLO_Tvr9V8x-OjfRJtkCPz6K-w7EI" | vercel env add REACT_APP_GOOGLE_MAPS_API_KEY production
echo ""

echo "Adding REACT_APP_API_URL..."
echo "https://home-history-project.onrender.com" | vercel env add REACT_APP_API_URL production
echo ""

# Step 5: Deploy
echo "Step 5: Deploying to production..."
read -p "Deploy to production now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo "✓ Deployment complete!"
else
    echo "Skipping deployment. You can deploy later with: vercel --prod"
fi

echo ""
echo "================================================"
echo "Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Visit your Vercel dashboard to view the deployment"
echo "2. Test the deployed app"
echo "3. Configure custom domain if needed"
echo ""

