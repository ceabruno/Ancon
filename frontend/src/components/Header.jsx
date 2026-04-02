import React, { useState } from 'react';

// Ícono SVG elegante para el usuario (reemplaza al emoji)
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
      <h1 className="logo">AnCon SPA</h1>
      
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </div>

      <nav className={`nav ${isOpen ? 'nav-mobile-active' : ''}`}>
        <a href="#inicio" className="nav-link" onClick={() => setIsOpen(false)}>Inicio</a>
        <a href="#nosotros" className="nav-link" onClick={() => setIsOpen(false)}>Nosotros</a>
        <a href="#servicios" className="nav-link" onClick={() => setIsOpen(false)}>Servicios</a>
        
        {/* Aquí integramos el nuevo ícono SVG */}
        <a href="#login" className="nav-link btn-login" onClick={() => setIsOpen(false)}>
          <UserIcon /> Iniciar Sesión
        </a>

        <a href="#contacto" className="btn-header-cta" onClick={() => setIsOpen(false)}>
          Agendar Reunión
        </a>
      </nav>
    </header>
  );
}