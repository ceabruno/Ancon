import React from 'react';
import { motion } from 'framer-motion';

export default function Contacto() {
  return (
    <section id="contacto" className="section-light">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container"
      >
        <h2 className="section-title">Agendar Reunión</h2>
        <p className="text">Déjanos tus datos y nos pondremos en contacto contigo a la brevedad para coordinar nuestra reunión.</p>
        
        <form className="form">
          <input type="text" placeholder="Nombre de la empresa" className="input" />
          <input type="email" placeholder="Correo electrónico" className="input" />
          <textarea placeholder="¿En qué podemos ayudarte?" className="textarea"></textarea>
          <button type="submit" className="btn-primary">Enviar Mensaje</button>
        </form>
      </motion.div>
    </section>
  );
}