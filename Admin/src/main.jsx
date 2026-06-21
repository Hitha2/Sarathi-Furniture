import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SearchProvider } from "./context/SearchContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <App />
    </SearchProvider>
  </StrictMode>,
)
