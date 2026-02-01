
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Prakhar AI: Booting systems...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // We render the app
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // We hide the loader after a tiny pause to ensure styles are applied
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) {
          loader.classList.add('hidden-loader');
          setTimeout(() => loader.style.display = 'none', 500);
        }
      }, 300);
    });

    // Emergency clear if window.load already fired
    if (document.readyState === 'complete') {
      setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) loader.classList.add('hidden-loader');
      }, 500);
    }

  } catch (error) {
    console.error("Prakhar AI: Startup Failure:", error);
    const status = document.getElementById('status-text');
    if (status) status.innerText = "System Error";
  }
}
