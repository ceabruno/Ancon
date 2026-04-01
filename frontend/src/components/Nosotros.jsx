import React from 'react';
import { motion } from 'framer-motion';

export default function Nosotros() {
  return (
    <section id="nosotros" className="section-light">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container"
      >
        <h2 className="section-title">Quiénes Somos</h2>
        <p className="text">
          Somos Asesorías e inversiones AnCon SPA. Nuestro compromiso es ser el aliado estratégico de las Pymes consolidadas, brindando claridad y orden en sus finanzas.
        </p>
      </motion.div>
    </section>
  );
}