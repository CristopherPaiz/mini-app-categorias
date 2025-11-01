import React from "react";
import PropTypes from "prop-types";

const CategoryGrid = ({ categoriasPrincipales, seleccionadas, onCategoryClick, onToggle }) => {
  const handleCheckboxClick = (e, id) => {
    e.stopPropagation();
    onToggle(id);
  };

  return (
    <div className="category-grid">
      {categoriasPrincipales.map((cat) => (
        <div key={cat.id} className={`category-card ${seleccionadas.has(cat.id) ? "selected" : ""}`} onClick={() => onCategoryClick(cat)}>
          <div className="card-content">
            <div className="emoji">{cat.emoji}</div>
            <div className="name">{cat.nombre}</div>
          </div>
          <div className="card-checkbox-container" onClick={(e) => handleCheckboxClick(e, cat.id)}>
            <label className="subcategory-item">
              <input type="checkbox" checked={seleccionadas.has(cat.id)} readOnly />
              <span className="custom-checkbox">
                <span className="checkmark"></span>
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

CategoryGrid.propTypes = {
  categoriasPrincipales: PropTypes.array.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CategoryGrid;
