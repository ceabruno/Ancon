import React from 'react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.webp'; 

export default function Hero() {
  return (
    <section id="inicio" className="hero-section">
      <div className="container hero-container">
        <motion.div className="hero-text" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="hero-title">
            Tu Aliado Estratégico en <span className="text-esmeralda">Gestión Contable</span> y Financiera
          </h1>
          <p className="hero-subtitle">Optimizamos los recursos de tu empresa con soluciones contables, tributarias y laborales a medida.</p>
          <a href="#contacto" className="btn-primary d-inline-block">Solicitar Asesoría</a>
        </motion.div>

        <motion.div className="hero-image" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <img src={heroImg} alt="Asesoría Contable AnCon" className="hero-img-main" />
        </motion.div>
      </div>
    </section>
  );
}