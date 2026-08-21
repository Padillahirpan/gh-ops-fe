/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_API?: 'true' | 'false'
  readonly VITE_ENABLE_DEMO_SEED?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
