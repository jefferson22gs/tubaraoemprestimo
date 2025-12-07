import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA support and Request Notification Permissions
if ('serviceWorker' in navigator) {
  // Avoid registration in specific preview environments if causing issues, but keeping robust for PWA
  const isPreview = window.location.hostname.includes('content.goog');
  
  if (!isPreview) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
  }
}