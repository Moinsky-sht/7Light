#!/bin/bash

# Configuration
SERVER_IP="49.232.240.128"
SERVER_USER="root"
# Assuming the project is at /root/7Light/web or similar. 
# Since we couldn't verify, we will upload to a temp folder and ask user to move it, 
# or assume a standard path if they provided one earlier (they didn't).
# Let's try to upload to ~/7Light-deploy and then the user can sync it.
REMOTE_DIR="~/7Light-deploy"

echo "Deploying to $SERVER_USER@$SERVER_IP..."

# 1. Build locally
echo "Building project..."
cd web
npm run build

# 2. Upload files
echo "Uploading files..."
# Exclude node_modules, .git, .output, .nuxt, data (to preserve DB)
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'data/*.db' --exclude '.output' --exclude '.nuxt' . $SERVER_USER@$SERVER_IP:$REMOTE_DIR

# 3. Remote commands
echo "Executing remote commands..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
  cd ~/7Light-deploy
  
  # Install dependencies
  npm install
  
  # Build again on server (optional if we uploaded .output, but safer to build there or just upload source)
  # Here we uploaded source.
  npm run build
  
  # Run seed script to fix admin user
  # We need to start the server first or run the script via node if possible.
  # Assuming standard nuxt start or pm2.
  # Let's try to run the seed script directly if possible, or trigger it via curl after start.
  
  # Example: using curl if server is running on port 3000
  # curl -X POST http://localhost:3000/api/seed/mock-users
  
  echo "Deployment files uploaded. Please restart your PM2 process and run the seed script."
EOF

echo "Done!"
