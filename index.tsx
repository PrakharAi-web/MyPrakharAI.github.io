
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Prakhar AI: Initializing core systems...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Prakhar AI: Successfully mounted to DOM.");
  } catch (error) {
    console.error("Critical Initialization Error:", error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #EF4444; font-weight: 900; margin-bottom: 10px;">Startup Failure</h2>
        <p style="color: #64748b; max-width: 400px; line-height: 1.5;">Prakhar AI could not start. This is usually due to an internet interruption or a browser security setting. Please try refreshing.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">Retry Boot</button>
      </div>
    `;
  }
}
