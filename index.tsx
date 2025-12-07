
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA support and Request Notification Permissions
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
      
      // Request Notification Permission on load (for demo purposes)
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    console.log('Notification permission granted');
                    // Simulate a welcome notification
                    // registration.showNotification('Bem-vindo ao Tubarão!', { body: 'Seu app está pronto.' });
                }
            });
        }
      }

    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
