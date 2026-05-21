import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { loadModels } from './utils/faceApi';

// Load face-api models on app start
loadModels().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
