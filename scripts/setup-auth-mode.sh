#!/bin/bash

# Auth Mode Setup Script
# Helps users quickly set up the auth mode toggle system

echo "🧩 Auth Mode Toggle Setup Script"
echo "================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.local.example .env.local
    echo "✅ .env.local created with mock auth enabled"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
    echo "📝 Creating .env.dev from template..."
    cp env.dev.example .env.dev
    echo "✅ .env.dev created with Azure auth enabled"
else
    echo "⚠️  .env.dev already exists, skipping creation"
fi

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "📝 Creating .env.prod from template..."
    cp env.prod.example .env.prod
    echo "✅ .env.prod created with Azure auth enabled"
else
    echo "⚠️  .env.prod already exists, skipping creation"
fi

echo ""
echo "🎯 Auth Mode Configuration:"
echo "=========================="

# Show current .env.local configuration
if [ -f ".env.local" ]; then
    echo "📁 .env.local (Mock Mode):"
    grep -E "VITE_USE_MOCK_AUTH|VITE_ENVIRONMENT" .env.local | sed 's/^/  /'
fi

# Show current .env.dev configuration
if [ -f ".env.dev" ]; then
    echo "📁 .env.dev (Azure Mode):"
    grep -E "VITE_USE_MOCK_AUTH|VITE_ENVIRONMENT" .env.dev | sed 's/^/  /'
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "======================="
echo "  Mock Mode:    npm run dev"
echo "  Azure Mode:   npm run dev --mode dev"
echo "  Run Tests:    npm test"
echo "  Seed Data:    npm run test:seed seed"

echo ""
echo "🔧 Environment Variables to Configure:"
echo "======================================"
echo "  Frontend:"
echo "    VITE_USE_MOCK_AUTH=true/false"
echo "    VITE_ENVIRONMENT=local/dev/prod"
echo "    VITE_AZURE_CLIENT_ID=your-client-id"
echo ""
echo "  Backend:"
echo "    USE_MOCK_AUTH=true/false"
echo "    NODE_ENV=development/production"
echo "    DATABASE_URL=postgresql://..."

echo ""
echo "📚 Documentation:"
echo "================="
echo "  - AUTH_MODE_TOGGLE_IMPLEMENTATION.md"
echo "  - tests/rbac/README.md"
echo "  - Environment files: env.*.example"

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo "You can now switch between mock and Azure authentication modes."
echo "Check the documentation for detailed usage instructions."
