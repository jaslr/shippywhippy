# API Routes Documentation

This directory contains the API routes for the Shippy Wippy application. Below is an overview of each API endpoint and its functionality.

## api.australia-post-lookup.ts

This API handles Australia Post shipping calculations and uptime checks.

- **Endpoint**: `/api/australia-post-lookup`
- **Method**: POST
- **Functionality**:
  - Performs uptime checks for the Australia Post API
  - Calculates shipping rates using the Australia Post API
- **Parameters**:
  - `apiKey`: Australia Post API key
  - `checkType`: Either "uptime" or "shipping"

## api.carrier-service.ts

This API handles carrier service rate calculations for Shopify.

- **Endpoint**: `/api/carrier-service`
- **Method**: POST
- **Functionality**:
  - Calculates shipping rates for Shopify orders
  - Returns rate options for Standard and Express shipping
- **Note**: This is a mock implementation and should be replaced with actual carrier service logic.

## api.shop-info.ts

This API retrieves and updates shop information.

- **Endpoint**: `/api/shop-info`
- **Method**: GET
- **Functionality**:
  - Retrieves shop information from the database
  - If the shop doesn't exist, creates a new shop entry
  - Updates existing shop information with the latest data from Shopify

## Webhook Routes

### webhooks.app.uninstalled.tsx

Handles the app uninstallation webhook.

- **Endpoint**: `/webhooks/app/uninstalled`
- **Method**: POST
- **Functionality**: Processes the app uninstallation event

### webhooks.customers.data_request.tsx

Handles customer data request webhooks for GDPR compliance.

- **Endpoint**: `/webhooks/customers/data_request`
- **Method**: POST
- **Functionality**: Processes customer data request events

### webhooks.customers.redact.tsx

Handles customer data redaction webhooks for GDPR compliance.

- **Endpoint**: `/webhooks/customers/redact`
- **Method**: POST
- **Functionality**: Processes customer data redaction events

### webhooks.shop.redact.tsx

Handles shop data redaction webhooks for GDPR compliance.

- **Endpoint**: `/webhooks/shop/redact`
- **Method**: POST
- **Functionality**: Processes shop data redaction events

## Authentication Routes

### auth.$.tsx

Handles OAuth authentication for the app.

- **Endpoint**: `/auth/*`
- **Method**: GET
- **Functionality**: Processes OAuth requests and redirects

### auth.login/route.tsx

Handles the login process for the app.

- **Endpoint**: `/auth/login`
- **Methods**: GET, POST
- **Functionality**: 
  - GET: Renders the login form
  - POST: Processes login attempts

## Main App Routes

### app._index.tsx

The main page of the Shippy Wippy app.

- **Endpoint**: `/app`
- **Method**: GET
- **Functionality**: 
  - Displays the main dashboard
  - Shows diagnostics information
  - Provides carrier configuration options

### app.additional.tsx

An additional page for the app, demonstrating multi-page navigation.

- **Endpoint**: `/app/additional`
- **Method**: GET
- **Functionality**: Displays additional information and resources

### app.tsx

The main app layout component.

- **Endpoint**: `/app`
- **Method**: GET
- **Functionality**: Provides the main layout for the app and handles authentication

For more detailed information on each route and its implementation, please refer to the individual files in this directory.
