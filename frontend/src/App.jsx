import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Portal from './components/Portal';
import './App.css'; 
import Header from './components/Header';
import Hero from './components/Hero';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import Contacto from './components/Contacto';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import Login from './components/Login';

// 1. AGRUPAMOS TU PÁGINA PÚBLICA
// Metemos todas tus secciones aquí. Como ves, ya NO está el Login al final.
const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Nosotros />
      <Servicios />
      <Contacto />
      <WhatsAppButton />
      <Footer />
    </>
  );
};

// 2. EL MOTOR DE RUTAS (Tu única función App)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta 1: ancon.cl/ -> Muestra toda tu página pública */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Ruta 2: ancon.cl/login -> Muestra SOLO el formulario de inicio de sesión */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta 3: ancon.cl/portal -> Muestra el interior del portal privado */}
        <Route path="/portal" element={<Portal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;