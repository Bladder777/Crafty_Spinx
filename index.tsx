// FIX: Corrected the triple-slash directive to reference the standard "react" types.
// The previous reference to "react/global" was invalid and caused a "type definition not found" error.
// Using the standard "react" reference loads the necessary JSX type definitions globally,
// which is required due to a likely misconfiguration in tsconfig.json that prevents automatic type acquisition.
/// <reference types="react" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
