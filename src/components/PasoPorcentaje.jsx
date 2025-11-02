import React from "react";
import PropTypes from "prop-types";

const PasoPorcentaje = ({ porcentaje, onPorcentajeChange }) => {
  const porcentajes = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  return (
    <div className="step-container">
      <h2>📉 Paso 1: Descuento Mínimo</h2>
      <p>Elige el porcentaje de descuento mínimo que deben tener las ofertas para que te notifiquemos. ¡Solo lo mejor para ti!</p>
      <div className="percentage-grid">
        {porcentajes.map((p) => (
          <button key={p} className={`percentage-button ${porcentaje === p ? "selected" : ""}`} onClick={() => onPorcentajeChange(p)}>
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
};

PasoPorcentaje.propTypes = {
  porcentaje: PropTypes.number.isRequired,
  onPorcentajeChange: PropTypes.func.isRequired,
};

export default PasoPorcentaje;
