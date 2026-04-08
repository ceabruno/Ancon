import React from 'react';
import { motion } from 'framer-motion';
import nosotrosImg from '../assets/nosotros.webp'; // Asegúrate de tener una imagen con este nombre

export default function Nosotros() {
  return (
    <section id="nosotros" className="section-light">
      <div className="container nosotros-container">
        
        {/* LADO IZQUIERDO: IMAGEN */}
        <motion.div 
          className="nosotros-col"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src={nosotrosImg} 
            alt="Equipo AnCon SPA" 
            className="nosotros-img"
          />
        </motion.div>

        {/* LADO DERECHO: TEXTO */}
        <motion.div 
          className="nosotros-col"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Quiénes Somos</h2>
          <p className="text text-left">
            En <strong>AnCon SPA</strong>, nacimos con la misión de simplificar la gestión contable y financiera para emprendedores y empresas chilenas. 
          </p>
          <p className="text text-left">
            Nuestro equipo combina años de experiencia técnica con un enfoque moderno y tecnológico, permitiéndote tomar decisiones informadas con datos reales y actualizados. No somos solo contadores; somos tus socios en el crecimiento.
          </p>
          
          <div className="nosotros-stats">
            <div>
              <h4>+10 Años</h4>
              <p>De experiencia en el mercado.</p>
            </div>
            <div>
              <h4>100% Digital</h4>
              <p>Procesos optimizados y sin papeles.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}