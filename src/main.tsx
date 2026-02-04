import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { migrateAuthFromLocalStorage } from '@/lib/migrateAuthFromLocalStorage'

// Clear legacy auth from localStorage (auth now in cookies). TODO: remove when safe.
migrateAuthFromLocalStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
