import React from "react";
import PropTypes from "prop-types";

const PasoNombre = ({ nombre, onNombreChange }) => {
  return (
    <div className="step-container">
      <h2>👋 Paso 1: Tu Nombre</h2>
      <p>Nos gusta saber a quién nos dirigimos. Por favor, dinos cómo prefieres que te llamemos.</p>
      <div className="input-container">
        <input
          type="text"
          className="custom-input"
          placeholder="Escribe tu nombre aquí"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
        />
      </div>
    </div>
  );
};

PasoNombre.propTypes = {
  nombre: PropTypes.string.isRequired,
  onNombreChange: PropTypes.func.isRequired,
};

export default PasoNombre;
