import React, { useState } from "react";
import PropTypes from "prop-types";

const CategoryItem = ({ categoria, subcategorias, seleccionadas, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const childrenIds = subcategorias.map((c) => c.id);
  const selectedChildrenCount = childrenIds.filter((id) => seleccionadas.has(id)).length;

  let checkState = "unchecked";
  if (selectedChildrenCount === childrenIds.length && childrenIds.length > 0) {
    checkState = "checked";
  } else if (selectedChildrenCount > 0 || (childrenIds.length === 0 && seleccionadas.has(categoria.id))) {
    checkState = "partial";
  }
  if (childrenIds.length === 0) {
    checkState = seleccionadas.has(categoria.id) ? "checked" : "unchecked";
  } else {
    if (selectedChildrenCount === childrenIds.length) checkState = "checked";
    else if (selectedChildrenCount > 0) checkState = "partial";
    else checkState = "unchecked";
  }

  return (
    <div className="category-item">
      <div className="category-header" onClick={() => subcategorias.length > 0 && setIsExpanded(!isExpanded)}>
        <div
          className={`custom-checkbox ${checkState}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(categoria.id, true);
          }}
        >
          <div className="checkmark"></div>
        </div>
        <div className="category-content">
          <span className="emoji">{categoria.emoji}</span>
          <span className="name">{categoria.nombre}</span>
        </div>
        {subcategorias.length > 0 && <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>▶️</span>}
      </div>
      {subcategorias.length > 0 && (
        <div className={`subcategories-container ${isExpanded ? "expanded" : ""}`}>
          <div className="subcategories-inner">
            <ul className="subcategory-list">
              {subcategorias.map((sub) => (
                <li key={sub.id} className="subcategory-item" onClick={() => onToggle(sub.id, false)}>
                  <div className={`custom-checkbox ${seleccionadas.has(sub.id) ? "checked" : ""}`}>
                    <div className="checkmark"></div>
                  </div>
                  <span className="emoji">{sub.emoji}</span>
                  <span className="name">{sub.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

CategoryItem.propTypes = {
  categoria: PropTypes.object.isRequired,
  subcategorias: PropTypes.array.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CategoryItem;
