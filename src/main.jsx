import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Restore path from GitHub Pages 404.html SPA redirect
const redirect = sessionStorage.getItem('spa_redirect')
if (redirect && redirect !== '/') {
  sessionStorage.removeItem('spa_redirect')
  window.history.replaceState(null, '', '/manage-my-hotel' + redirect)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
