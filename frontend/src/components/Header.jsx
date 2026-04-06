import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 1. IMPORTAMOS EL LOGO
// Fíjate cómo la ruta debe coincidir exactamente con el nombre de tu archivo
import logoAncon from '../assets/Logo fondo chico.png'; 

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      
      {/* 2. REEMPLAZAMOS EL TEXTO POR LA IMAGEN */}
      {/* Lo envolvemos en un <Link> para que al hacer clic en el logo, te devuelva al inicio */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src={logoAncon} 
          alt="AnCon SPA Logo" 
          style={{ height: '95px', objectFit: 'contain' }} 
        />
      </Link>
      
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </div>

      <nav className={`nav ${isOpen ? 'nav-mobile-active' : ''}`}>
        <a href="#inicio" className="nav-link" onClick={() => setIsOpen(false)}>Inicio</a>
        <a href="#nosotros" className="nav-link" onClick={() => setIsOpen(false)}>Nosotros</a>
        <a href="#servicios" className="nav-link" onClick={() => setIsOpen(false)}>Servicios</a>
        
        <Link to="/login" className="nav-link btn-login" onClick={() => setIsOpen(false)}>
          <UserIcon /> Iniciar Sesión
        </Link>

        <a href="#contacto" className="btn-header-cta" onClick={() => setIsOpen(false)}>
          Agendar Reunión
        </a>
      </nav>
    </header>
  );
}