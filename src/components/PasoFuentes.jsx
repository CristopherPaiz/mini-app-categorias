import React from "react";
import PropTypes from "prop-types";
import "./PasoFuentes.css";

const PasoFuentes = ({ fuentes, seleccionadas, onToggle }) => {
  return (
    <div className="paso-container">
      <h2>¿De dónde quieres recibir ofertas?</h2>
      <p className="descripcion">Selecciona las tiendas que te interesan.</p>

      <div className="fuentes-list">
        {fuentes.map((fuente) => {
          const isSelected = seleccionadas.has(fuente.id);
          return (
            <div key={fuente.id} className={`fuente-item ${isSelected ? "selected" : ""}`} onClick={() => onToggle(fuente.id)}>
              <div className="fuente-info">
                <span className="fuente-nombre">{fuente.nombre}</span>
                <span className="fuente-url">{new URL(fuente.url).hostname}</span>
              </div>
              <div className="checkbox">{isSelected && <span className="checkmark">✔</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PasoFuentes.propTypes = {
  fuentes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PasoFuentes;
