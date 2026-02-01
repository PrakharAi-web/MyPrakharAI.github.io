
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Initialization failed:", error);
    rootElement.innerHTML = `<div style="padding: 20px; font-family: sans-serif; text-align: center;">
      <h2 style="color: #FF6B00">Prakhar AI Encountered a Startup Error</h2>
      <p>Please check your browser console for details.</p>
    </div>`;
  }
}
