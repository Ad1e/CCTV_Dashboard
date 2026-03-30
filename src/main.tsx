import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css'
import './index.css'
import App from './App.tsx'

try {
  const t = localStorage.getItem('bsu-cctv-theme')
  if (t === 'light' || t === 'dark') {
    document.documentElement.setAttribute('data-theme', t)
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
