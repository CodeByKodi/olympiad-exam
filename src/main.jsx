import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { OfflineIndicator } from './components/OfflineIndicator.jsx'
import { registerSW } from './utils/registerSW.js'
import App from './App.jsx'

registerSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <OfflineIndicator />
    </ErrorBoundary>
  </StrictMode>,
)
