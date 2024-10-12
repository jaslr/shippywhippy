import { action } from '../app/routes/api.carrier-service';
import { jest, expect, test } from '@jest/globals';

// Mock the shopify object
jest.mock('../app/shopify.server', () => ({
  __esModule: true,
  default: {
    authenticate: {
      admin: jest.fn(),
    },
  },
}));

test('Carrier Service returns valid rates', async () => {
    const mockRequest = new Request('https://your-app-url.com/api/carrier-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrierService: {
                id: 'gid://shopify/DeliveryCarrierService/123456789',
                name: 'Test Carrier',
                callback_url: 'https://your-app-url.com/api/carrier-service',
                service_discovery: true,
            },
            rate: {
                name: 'Standard Shipping',
                price: '5.00',
                currency: 'USD',
                min_delivery_date: '2024-05-01',
                max_delivery_date: '2024-05-05',
            },
            shippingAddress: {
                country: 'US',
                province: 'CA',
                city: 'San Francisco',
                zip: '94107',
                address1: '123 Market St',
                address2: 'Suite 100',
            },
        }),
    });

    const actionArgs = {
      request: mockRequest,
      params: {},
      context: {}
    };

    const response = await action(actionArgs);
    
    expect(response).not.toBeNull();
    expect(response instanceof Response).toBe(true);

    if (response instanceof Response) {
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.rates).toBeDefined();
        expect(Array.isArray(data.rates)).toBe(true);
        expect(data.rates.length).toBeGreaterThan(0);
    }
});