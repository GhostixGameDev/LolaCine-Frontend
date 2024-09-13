/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_VOTE_MASTER: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }