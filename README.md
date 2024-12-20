# Shopify App Template - Remix

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using the [Remix](https://remix.run) framework.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](https://shopify.dev/docs/apps/getting-started/create).

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-remix) for more details on the Remix app package.

## About Shippy Whippy

Shippy Whippy is a Shopify app designed to connect stores to Australia Post Carrier Calculated Shipping Rates. This integration allows merchants to provide accurate, real-time shipping rates from Australia Post to their customers during checkout.

## API Routes Documentation

For detailed information about the API routes used in this application, please refer to the [API Routes README](app/routes/README.md).

## Color Palette

The following colors are used in the Shippy Whippy app, outside of the Polaris Design System:

- `#FF4500` (Orange-Red)
- `#8B008B` (Dark Magenta)
- `#FF6347` (Tomato)
- `#4B0082` (Indigo)

## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify CLI**: Install the Shopify CLI:
   ```bash
   # Install Shopify CLI
   npm install -g @shopify/cli @shopify/theme
   npm install -g @shopify/app
   ```
3. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
4. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
5. **PostgreSQL Setup**: If using WSL, install the required components:
   ```bash
   # Install PostgreSQL and expect
   sudo apt update
   sudo apt install postgresql postgresql-contrib expect

   # Start PostgreSQL service
   sudo service postgresql start

   # Verify PostgreSQL port (important for connection string)
   sudo -u postgres psql -c "SHOW port;"

   # Create database user and database
   sudo -u postgres psql -p <your_port> << EOF
   CREATE USER shippywhippy_admin WITH PASSWORD 'password123' SUPERUSER;
   CREATE DATABASE shippywhippy OWNER shippywhippy_admin;
   GRANT ALL PRIVILEGES ON DATABASE shippywhippy TO shippywhippy_admin;
   EOF

   # Set up your .env file with the correct port
   echo 'DATABASE_URL="postgresql://shippywhippy_admin:password123@localhost:<your_port>/shippywhippy?schema=public"' > .env

   # Verify connection
   PGPASSWORD=password123 psql -U shippywhippy_admin -h localhost -p <your_port> -d shippywhippy -c "\conninfo"
   ```

   Note: PostgreSQL might run on a different port (e.g., 5433) instead of the default 5432. Always verify the port number and update your connection string accordingly.

### Setup

If you used the CLI to create the template, you can skip this section.

Using yarn:
