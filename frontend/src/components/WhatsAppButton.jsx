import React from 'react';

export default function WhatsAppButton() {
  const numero = "56912345678"; 
  const mensaje = "Hola, me gustaría agendar una reunión con AnCon SPA.";
  const enlace = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
      💬 WhatsApp
    </a>
  );
}