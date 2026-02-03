
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Failsafe: Forcibly hide the loader after 1.5 seconds regardless of app state
  const forceHideLoader = () => {
    const loader = document.getElementById('app-loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.classList.add('hidden-loader'), 500);
    }
  };

  try {
    root.render(<App />);
    // Normal dismissal happens inside App.tsx, but we set a backup timer here
    setTimeout(forceHideLoader, 1500);
  } catch (e) {
    console.error("Prakhar AI Boot Error:", e);
    forceHideLoader();
  }
}
