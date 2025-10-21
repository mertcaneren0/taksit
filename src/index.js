import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { HastaProvider } from './context/HastaContext';
import './styles.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <HastaProvider>
          <App />
        </HastaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
