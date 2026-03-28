import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PrepProvider } from './context/PrepContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrepProvider>
        <App />
    </PrepProvider>
  </StrictMode>,
)
