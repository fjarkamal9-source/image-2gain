import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LikesBadgeProvider } from './context/LikesBadgeContext';
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import './styles/components.css';

CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  const urlObj = new URL(url);
  const code = urlObj.searchParams.get('code');
  const hash = urlObj.hash;
  if (code) {
    window.history.pushState({}, '', '/auth/callback?code=' + encodeURIComponent(code));
  } else if (hash) {
    window.history.pushState({}, '', '/auth/callback' + hash);
  }
  window.dispatchEvent(new CustomEvent('capacitor-url-open', { detail: { url } }));
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LikesBadgeProvider>
          <App />
        </LikesBadgeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
