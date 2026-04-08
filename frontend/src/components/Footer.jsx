import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} AnCon SPA. Todos los derechos reservados.</p>
        <p className="footer-credit">
          Ilustración principal por <a href="https://www.freepik.com/free-vector/business-budget-management_25638048.htm" target="_blank" rel="noopener noreferrer" className="footer-link">Freepik</a>
        </p>
      </div>
    </footer>
  );
}