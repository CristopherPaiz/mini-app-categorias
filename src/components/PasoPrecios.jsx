import React from "react";
import PropTypes from "prop-types";
import RangeSlider from "./RangeSlider";

const PasoPrecios = ({ precioMin, precioMax, onPreciosChange }) => {
  const formatLabel = (value) => {
    if (value >= 10000) return "Sin Límite";
    return `Q${value.toLocaleString("es-GT")}`;
  };

  return (
    <div className="step-container">
      <h2>💰 Paso 2: Rango de Precios</h2>
      <p>Ajusta el control deslizante para establecer el rango de precios que se ajuste a tu presupuesto.</p>
      <div className="price-range-container">
        <div className="price-labels">
          <span>{formatLabel(precioMin)}</span>
          <span>{formatLabel(precioMax)}</span>
        </div>
        <RangeSlider
          min={0}
          max={10000}
          step={50}
          value={{ min: precioMin, max: precioMax }}
          onChange={({ min, max }) => onPreciosChange(min, max)}
        />
      </div>
    </div>
  );
};

PasoPrecios.propTypes = {
  precioMin: PropTypes.number.isRequired,
  precioMax: PropTypes.number.isRequired,
  onPreciosChange: PropTypes.func.isRequired,
};

export default PasoPrecios;
