import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Registro do Service Worker apontando para a pasta PUBLIC
if ('serviceWorker' in navigator) {
  // Verificação simples para evitar erros em alguns previews
  const isPreview = window.location.hostname.includes('content.goog');
  
  if (!isPreview) {
    window.addEventListener('load', () => {
        // CORREÇÃO: Apontar para ./public/sw.js
        navigator.serviceWorker.register('./public/sw.js')
          .then(registration => console.log('SW registrado: ', registration.scope))
          .catch(err => console.log('SW falhou: ', err));
    });
  }
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
