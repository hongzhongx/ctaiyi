/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_RPC_CLIENT_CONFIG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
