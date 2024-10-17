/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_DATABASE_URL: string;
    VITE_ARAMEX_API_KEY: string;
    // Add other environment variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
