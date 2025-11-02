import React from "react";
import PropTypes from "prop-types";

const PasoCategorias = ({ categoriasPrincipales, subcategoriasMap, seleccionadas, onToggle, onOpenDrawer }) => {
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
    <div className="step-container">
      <h2>Paso 3: Categorías</h2>
      <p>Elige las categorías de productos que te interesan.</p>
      <div className="category-grid">
        {categoriasPrincipales.map((cat) => {
          const state = getParentState(cat);
          const hasSubcategories = (subcategoriasMap[cat.id] || []).length > 0;
          const isSelected = state === "checked" || state === "partial";

          return (
            <div
              key={cat.id}
              className={`category-card ${isSelected ? "selected" : ""} ${state === "partial" ? "partial-border" : ""}`}
              onClick={() => (hasSubcategories ? onOpenDrawer(cat) : onToggle(cat.id, false))}
            >
              <div className="card-content">
                <div className="emoji">{cat.emoji}</div>
                <div className="name">{cat.nombre}</div>
              </div>
              {hasSubcategories && <div className="subcategory-indicator">Subcategorías</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

PasoCategorias.propTypes = {
  categoriasPrincipales: PropTypes.array.isRequired,
  subcategoriasMap: PropTypes.object.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onOpenDrawer: PropTypes.func.isRequired,
};

export default PasoCategorias;
