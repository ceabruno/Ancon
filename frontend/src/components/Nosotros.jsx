import React from 'react';
import { motion } from 'framer-motion';
import nosotrosImg from '../assets/nosotros.jpg'; // Asegúrate de tener una imagen con este nombre

export default function Nosotros() {
  return (
    <section id="nosotros" className="section-light">
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap' }}>
        
        {/* LADO IZQUIERDO: IMAGEN */}
        <motion.div 
          style={{ flex: '1', minWidth: '300px' }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src={nosotrosImg} 
            alt="Equipo AnCon SPA" 
            style={{ width: '100%', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
          />
        </motion.div>

        {/* LADO DERECHO: TEXTO */}
        <motion.div 
          style={{ flex: '1', minWidth: '300px' }}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Quiénes Somos</h2>
          <p className="text" style={{ textAlign: 'left', marginLeft: '0' }}>
            En <strong>AnCon SPA</strong>, nacimos con la misión de simplificar la gestión contable y financiera para emprendedores y empresas chilenas. 
          </p>
          <p className="text" style={{ textAlign: 'left', marginLeft: '0' }}>
            Nuestro equipo combina años de experiencia técnica con un enfoque moderno y tecnológico, permitiéndote tomar decisiones informadas con datos reales y actualizados. No somos solo contadores; somos tus socios en el crecimiento.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
            <div>
              <h4 style={{ color: 'var(--esmeralda)' }}>+10 Años</h4>
              <p style={{ fontSize: '0.9rem' }}>De experiencia en el mercado.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--esmeralda)' }}>100% Digital</h4>
              <p style={{ fontSize: '0.9rem' }}>Procesos optimizados y sin papeles.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}