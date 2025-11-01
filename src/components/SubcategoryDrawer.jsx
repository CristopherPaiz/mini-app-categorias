import React from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const SubcategoryDrawer = ({ categoria, subcategorias, seleccionadas, onToggle, open, onOpenChange }) => {
  if (!open || !categoria) return null;

  return createPortal(
    <React.Fragment>
      <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={() => onOpenChange(false)} />
      <div className={`drawer-container ${open ? "open" : ""}`}>
        <div className="drawer-handle" />
        <h2>
          {categoria.emoji} {categoria.nombre}
        </h2>
        <ul className="subcategory-list">
          {subcategorias.map((sub) => (
            <li key={sub.id} onClick={() => onToggle(sub.id)}>
              <label className="subcategory-item">
                <input type="checkbox" checked={seleccionadas.has(sub.id)} readOnly />
                <span className="custom-checkbox">
                  <span className="checkmark"></span>
                </span>
                {sub.emoji} {sub.nombre}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>,
    document.body
  );
};

SubcategoryDrawer.propTypes = {
  categoria: PropTypes.object,
  subcategorias: PropTypes.array,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};

export default SubcategoryDrawer;
