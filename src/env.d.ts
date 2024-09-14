/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_VOTE_MASTER: string
    readonly VITE_BACKEND_URL: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }