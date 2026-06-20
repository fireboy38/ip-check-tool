import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { RefreshProvider } from './hooks/useGlobalRefresh';
import './styles/index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HashRouter>
      <RefreshProvider>
        <App />
      </RefreshProvider>
    </HashRouter>
  </React.StrictMode>
);
