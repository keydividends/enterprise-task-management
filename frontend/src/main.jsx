import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'dummy-microsoft-client-id',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  }
};
const msalInstance = new PublicClientApplication(msalConfig);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </MsalProvider>
  </StrictMode>,
)
