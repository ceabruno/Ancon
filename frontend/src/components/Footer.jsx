import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} AnCon SPA. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}