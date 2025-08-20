import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Login from "./pages/Login"
import Registrar from "./pages/Resgistrar.jsx"
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId='894459726309-20fo5om0q4m1u9kn303cr3mbim1gni25.apps.googleusercontent.com'>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Login />} /> 
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
