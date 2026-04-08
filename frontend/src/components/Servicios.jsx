import React from 'react';
import { motion } from 'framer-motion';

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-shrink">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function Servicios() {
  const listaServicios = [
    "ERP Contable", "Módulos de Ventas", "Producción y Personal", "Contabilidad e Informes",
    "Contabilidad Completa", "Declaraciones Mensuales y Anuales", "Remuneraciones",
    "Tesorería y Cobranza", "Asesoría", "Planificación Tributaria", "Planificación Financiera"
  ];

  return (
    <section id="servicios" className="section-dark">
      <div className="container">
        <motion.h2 className="section-title text-center mb-40" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Nuestros Servicios
        </motion.h2>
        
        <div className="servicios-grid">
          {listaServicios.map((s, i) => (
            <motion.div key={i} className="servicio-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
              <CheckIcon /><span>{s}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}