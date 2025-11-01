import React from "react";
import PropTypes from "prop-types";

const CategoryGrid = ({ categoriasPrincipales, subcategoriasMap, seleccionadas, onToggle, onOpenDrawer }) => {
  const getParentState = (cat) => {
    const children = subcategoriasMap[cat.id] || [];
    if (children.length === 0) {
      return seleccionadas.has(cat.id) ? "checked" : "unchecked";
    }
    const selectedChildren = children.filter((sub) => seleccionadas.has(sub.id));
    if (selectedChildren.length === 0) return "unchecked";
    if (selectedChildren.length === children.length) return "checked";
    return "partial";
  };

  return (
    <div className="category-grid">
      {categoriasPrincipales.map((cat) => {
        const state = getParentState(cat);
        const hasSubcategories = (subcategoriasMap[cat.id] || []).length > 0;

        return (
          <div key={cat.id} className={`category-card ${state === "checked" || state === "partial" ? "selected" : ""}`}>
            <div className="card-header">
              <label className="subcategory-item" onClick={() => onToggle(cat.id, true)}>
                <input type="checkbox" checked={state === "checked"} readOnly />
                <span className={`custom-checkbox ${state === "partial" ? "partial" : ""}`}>
                  <span className="checkmark"></span>
                </span>
              </label>
            </div>
            <div className="card-content" onClick={() => (hasSubcategories ? onOpenDrawer(cat) : onToggle(cat.id, false))}>
              <div className="emoji">{cat.emoji}</div>
              <div className="name">{cat.nombre}</div>
            </div>
            {hasSubcategories && (
              <button className="subcategory-button" onClick={() => onOpenDrawer(cat)}>
                Ver Subcategorías
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

CategoryGrid.propTypes = {
  categoriasPrincipales: PropTypes.array.isRequired,
  subcategoriasMap: PropTypes.object.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onOpenDrawer: PropTypes.func.isRequired,
};

export default CategoryGrid;
