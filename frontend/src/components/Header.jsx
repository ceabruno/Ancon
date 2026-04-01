import React, { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <h1 className="logo">AnCon SPA</h1>
      
      {/* Botón hamburguesa para móvil */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)} style={styles.mobileMenuIcon}>
        {isOpen ? '✕' : '☰'}
      </div>

      <nav className={`nav ${isOpen ? 'nav-mobile-active' : ''}`} style={isOpen ? styles.navMobile : {}}>
        <a href="#inicio" className="nav-link" onClick={() => setIsOpen(false)}>Inicio</a>
        <a href="#nosotros" className="nav-link" onClick={() => setIsOpen(false)}>Nosotros</a>
        <a href="#servicios" className="nav-link" onClick={() => setIsOpen(false)}>Servicios</a>
        {/* Destacamos Contacto como un botón diferente para que no se confunda */}
        <a href="#contacto" className="btn-header-cta" onClick={() => setIsOpen(false)}>
          Agendar Reunión
        </a>
      </nav>
    </header>
  );
}

const styles = {
  mobileMenuIcon: {
    display: 'none', // Se activa con Media Queries en el CSS
    fontSize: '2rem',
    color: 'white',
    cursor: 'pointer',
  },
  // Estilos rápidos para el CTA del header
  // (Idealmente mover estos a App.css más adelante)
};