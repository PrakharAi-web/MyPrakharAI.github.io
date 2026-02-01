import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    
    // Immediate removal of loader once rendering starts
    const loader = document.getElementById('app-loading-screen');
    if (loader) {
      loader.classList.add('hidden-loader');
    }
  } catch (e) {
    console.error("Prakhar AI: Critical Init Error", e);
  }
}