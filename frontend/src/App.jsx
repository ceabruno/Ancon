import React from 'react';
import './App.css'; 
import Header from './components/Header';
import Hero from './components/Hero';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import Contacto from './components/Contacto';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';

function App() {
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
}

export default App;