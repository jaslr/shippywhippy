export interface Carrier {
  name: string;
  isActive: boolean;
  apiKey: string;
}

export interface CarrierCardProps {
  shop: {
    id: string; // This is now a string (Shopify ID)
    shopifyUrl: string;
  };
  carrierName: string;
  statusURL: string;
  apiKeyEnvVar: string;
  defaultApiKey: string;
}

export interface CarrierCardState {
  isEnabled: boolean;
  apiKey: string;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  useDescription: boolean;
}

export type CarrierConfig = {
  id: number;
  shopId: number;
  carrierId: number;
  isActive: boolean;
  apiKey: string | null;
  memberNumber: string | null;
  useDescription: boolean;
  carrier: {
    id: number;
    name: string;
    defaultApiKey: string;
  };
};
