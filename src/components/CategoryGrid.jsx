import React from "react";
import PropTypes from "prop-types";

const CategoryGrid = ({ categoriasPrincipales, seleccionadas, onCategoryClick }) => {
  return (
    <div className="category-grid">
      {categoriasPrincipales.map((cat) => (
        <div key={cat.id} className={`category-card ${seleccionadas.has(cat.id) ? "selected" : ""}`} onClick={() => onCategoryClick(cat)}>
          <div className="emoji">{cat.emoji}</div>
          <div className="name">{cat.nombre}</div>
        </div>
      ))}
    </div>
  );
};

CategoryGrid.propTypes = {
  categoriasPrincipales: PropTypes.array.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onCategoryClick: PropTypes.func.isRequired,
};

export default CategoryGrid;
