#!/bin/bash
# Exit script if any command fails
set -e

echo "🚀 Starting Celiac Scanner Release Process..."

# 1. Provide an automated commit message if one wasn't passed in
COMMIT_MSG=${1:-"chore: Automated release deploy"}

# 2. Build the web preview folder
echo "📦 Step 1: Building the Web Preview..."
cd web-preview
npm run build
cd ..

# 3. Ask Firebase to deploy the newly built static files & cloud functions
echo "🔥 Step 2: Deploying to Firebase..."
firebase deploy --only hosting,functions,firestore

# 4. Save code to Github
echo "🐙 Step 3: Committing and Pushing to GitHub..."
git add .
git commit -m "$COMMIT_MSG" || echo "No new code changes to commit."
git push

echo "✅ Release Complete! Your Github is up-to-date and your app is live!"
