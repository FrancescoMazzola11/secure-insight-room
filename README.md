# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7b3c5bac-ae40-44c9-82a0-65cc3edbbc4e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7b3c5bac-ae40-44c9-82a0-65cc3edbbc4e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

## Requirements

This project requires **Node.js 18.0.0 or higher** and npm. The application uses modern JavaScript features and build tools that require a recent Node.js version.

### Quick Setup (Recommended)

If you have Node.js 18+ already installed:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Node.js Installation Options

**Option 1: Using NVM (Node Version Manager) - Recommended**
```sh
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# Reload your terminal or run:
source ~/.bashrc

# Install and use Node.js 18
nvm install 18
nvm use 18
```

**Option 2: Using NodeSource Repository (Ubuntu/Debian)**
```sh
# Add NodeSource repository and install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Option 3: Manual Installation (if other methods fail)**
```sh
# Download Node.js 18.20.4 binary
cd /tmp
wget https://nodejs.org/dist/v18.20.4/node-v18.20.4-linux-x64.tar.xz

# Extract and install
tar -xf node-v18.20.4-linux-x64.tar.xz
sudo mv node-v18.20.4-linux-x64 /opt/nodejs

# Create symlinks
sudo ln -sf /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -sf /opt/nodejs/bin/npm /usr/local/bin/npm

# Or add to PATH (add this to your ~/.bashrc)
export PATH=/opt/nodejs/bin:$PATH
```

### Troubleshooting

**If you see engine warnings during npm install:**
- These warnings appear when your Node.js version is older than required
- Update to Node.js 18+ using one of the methods above

**If npm run dev fails with syntax errors:**
- Ensure you're using Node.js 18.0.0 or higher: `node --version`
- If using manual installation, make sure the PATH is set correctly

**Development Server Access:**
Once running, the app will be available at:
- Local: http://localhost:8080/ (or the port shown in terminal)
- Network: Available on your local network IP addresses

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7b3c5bac-ae40-44c9-82a0-65cc3edbbc4e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
