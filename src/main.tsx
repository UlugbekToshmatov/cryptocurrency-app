import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppReducerContextProvider from './contexts/AppReducerContextProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppReducerContextProvider>
      <App />
    </AppReducerContextProvider>
  </StrictMode>,
)
