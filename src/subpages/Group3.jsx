import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import App from '../components/App.jsx'
import '../styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="ghostix.us.auth0.com"
      clientId="Ccm3j9a7wJTrZcQqGsjiqX8OBuSZSfRG"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://ghostix.us.auth0.com/api/v2/",
      }}
    >
      <App group={3}/>
    </Auth0Provider>
  </StrictMode>,
)