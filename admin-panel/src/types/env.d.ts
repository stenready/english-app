// Typed import.meta.env: only VITE_-prefixed variables reach client code
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
