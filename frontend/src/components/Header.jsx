import React, { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <h1 className="logo">AnCon SPA</h1>
      
      {/* Botón hamburguesa para móvil (Solo usa clases ahora) */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </div>

      {/* Navegación limpia */}
      <nav className={`nav ${isOpen ? 'nav-mobile-active' : ''}`}>
        <a href="#inicio" className="nav-link" onClick={() => setIsOpen(false)}>Inicio</a>
        <a href="#nosotros" className="nav-link" onClick={() => setIsOpen(false)}>Nosotros</a>
        <a href="#servicios" className="nav-link" onClick={() => setIsOpen(false)}>Servicios</a>
        
        {/* Usamos las clases nav-link y btn-login juntas */}
        <a href="#login" className="nav-link btn-login" onClick={() => setIsOpen(false)}>
          👤 Iniciar Sesión
        </a>

        <a href="#contacto" className="btn-header-cta" onClick={() => setIsOpen(false)}>
          Agendar Reunión
        </a>
      </nav>
    </header>
  );
}