import React from 'react';
import { motion } from 'framer-motion';

export default function Servicios() {
  const listaServicios = [
    "ERP Contable", "Contabilidad Completa", 
    "Declaraciones Mensuales", "Remuneraciones"
  ];

  return (
    <section id="servicios" className="section-dark">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          Nuestros Servicios
        </motion.h2>
        <div className="grid">
          {listaServicios.map((s, i) => (
            <div key={i} className="card">
              <h3 className="card-title">{s}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}