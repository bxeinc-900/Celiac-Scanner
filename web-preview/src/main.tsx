import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Add reset styles for React Native Web
const style = document.createElement('style');
style.textContent = `
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #000;
  }
  #root {
    display: flex;
    flex-direction: column;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
