import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    
    // Safety: Hide loader after a short timeout if the component doesn't do it
    setTimeout(() => {
      const loader = document.getElementById('app-loading-screen');
      if (loader && !loader.classList.contains('hidden-loader')) {
        loader.classList.add('hidden-loader');
      }
    }, 2000);
    
  } catch (e) {
    console.error("Prakhar AI: Critical Init Error", e);
    const loader = document.getElementById('app-loading-screen');
    if (loader) loader.classList.add('hidden-loader');
  }
}