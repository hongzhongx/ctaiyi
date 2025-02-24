/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_TEST_TRANSITIONS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
