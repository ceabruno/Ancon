import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="inicio" className="hero-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container"
      >
        <h2 className="hero-title">
          Mantener información al día, oportuna y confiable para la toma de decisiones.
        </h2>
        <p className="hero-subtitle">
          Especialistas en contabilidad integral para Pymes consolidadas.
        </p>
        <a href="#contacto" className="btn-primary">Agendar Reunión</a>
      </motion.div>
    </section>
  );
}