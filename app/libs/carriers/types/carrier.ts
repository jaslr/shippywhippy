export interface Carrier {
  name: string;
  isActive: boolean;
  apiKey: string;
}

export interface CarrierCardProps {
  shop: string;
  carrierName?: string;
  statusURL?: string;
  apiKeyEnvVar?: string;
  defaultApiKey?: string;
}

export interface CarrierCardState {
  isEnabled: boolean;
  apiKey: string;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  useDescription: boolean;
}
