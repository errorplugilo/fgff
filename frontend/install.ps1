# Enable Yarn package manager
corepack enable

# Set Yarn version to stable
yarn set version stable

# Install dependencies
yarn install

# Setup VSCode SDKs
yarn dlx @yarnpkg/sdks vscode