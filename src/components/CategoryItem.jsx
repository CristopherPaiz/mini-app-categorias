import React from "react";
import PropTypes from "prop-types";

const CategoryItem = ({ categoria, subcategorias, seleccionadas, onToggle }) => {
  const estaSeleccionada = seleccionadas.has(categoria.id);

  const handleToggle = (e) => {
    e.preventDefault();
    onToggle(categoria.id);
  };

  return (
    <details>
      <summary>
        <div className="summary-content" onClick={handleToggle}>
          <label className="checkbox-label">
            <input type="checkbox" checked={estaSeleccionada} readOnly />
            <span className="custom-checkbox">
              <span className="checkmark"></span>
            </span>
            {categoria.emoji} {categoria.nombre}
          </label>
        </div>
        {subcategorias.length > 0 && <span className="expand-icon">▶️</span>}
      </summary>
      {subcategorias.length > 0 && (
        <ul className="subcategory-list">
          {subcategorias.map((sub) => (
            <li key={sub.id}>
              <label className="checkbox-label">
                <input type="checkbox" checked={seleccionadas.has(sub.id)} onChange={() => onToggle(sub.id)} />
                <span className="custom-checkbox">
                  <span className="checkmark"></span>
                </span>
                {sub.emoji} {sub.nombre}
              </label>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
};

CategoryItem.propTypes = {
  categoria: PropTypes.object.isRequired,
  subcategorias: PropTypes.array.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CategoryItem;
