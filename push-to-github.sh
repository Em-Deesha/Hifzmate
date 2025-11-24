#!/bin/bash
# Script to push to GitHub
# This will prompt for your GitHub credentials

cd "$(dirname "$0")"

echo "Pushing to GitHub..."
echo "You will be prompted for your GitHub username and password."
echo "Note: Use a Personal Access Token instead of your password."
echo ""
echo "To create a token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Generate new token (classic)"
echo "3. Select 'repo' scope"
echo "4. Copy the token and use it as your password"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View your repo at: https://github.com/Em-Deesha/Hifzmate"
else
    echo ""
    echo "❌ Push failed. Please check your credentials."
fi


