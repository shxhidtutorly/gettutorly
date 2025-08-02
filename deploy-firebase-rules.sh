#!/bin/bash

# Firebase Rules Deployment Script
# This script deploys Firestore and Storage rules to Firebase

echo "🚀 Starting Firebase Rules Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Deploy Firestore rules
echo "📝 Deploying Firestore rules..."
if firebase deploy --only firestore:rules; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Storage rules
echo "📁 Deploying Storage rules..."
if firebase deploy --only storage; then
    echo "✅ Storage rules deployed successfully!"
else
    echo "❌ Failed to deploy Storage rules"
    exit 1
fi

echo "🎉 All Firebase rules deployed successfully!"
echo ""
echo "📋 Summary:"
echo "- Firestore rules: ✅ Deployed"
echo "- Storage rules: ✅ Deployed"
echo ""
echo "🔒 Security rules are now active and protecting your data." 