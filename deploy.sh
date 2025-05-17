
#!/bin/bash
echo "Building the project..."
npm run build

echo "Verifying build output..."
if [ ! -d "dist" ]; then
  echo "Error: Build failed! dist directory not found."
  exit 1
fi

echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment complete!"
