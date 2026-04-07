import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} AnCon SPA. Todos los derechos reservados.</p>
        
        {/* CRÉDITO A FREEPIK */}
        <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>
          Ilustración principal por <a 
            href="https://www.freepik.com/free-vector/business-budget-management_25638048.htm" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--perla)', textDecoration: 'underline' }}
          >
            Freepik
          </a>
        </p>
        
      </div>
    </footer>
  );
}