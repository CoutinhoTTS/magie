/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_DB_NAME?: string
  readonly VITE_CHAT_DB_NAME?: string
  

}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
