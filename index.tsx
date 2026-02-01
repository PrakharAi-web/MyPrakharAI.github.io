
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Prakhar AI: Primary systems engaging...");

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
    
    // Hide the loader as soon as React has completed the mount
    // Using requestAnimationFrame ensures the browser has painted the initial UI
    requestAnimationFrame(() => {
      setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) {
          loader.classList.add('hidden-loader');
          console.log("Prakhar AI: Neural Core Online.");
        }
      }, 500);
    });

  } catch (error) {
    console.error("Prakhar AI: Critical Mounting Failure:", error);
    const status = document.getElementById('status-text');
    if (status) status.innerText = "System Failure";
  }
}
