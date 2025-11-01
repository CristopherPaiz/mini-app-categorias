import React from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const SelectionItem = ({ item, state, onToggle }) => (
  <li className={`selection-item ${item.padre_id === null ? "parent" : ""}`} onClick={() => onToggle(item.id, item.padre_id === null)}>
    <div className={`custom-checkbox ${state}`}>
      <div className="checkmark"></div>
    </div>
    <span>
      {item.emoji} {item.nombre}
    </span>
  </li>
);

SelectionItem.propTypes = {
  item: PropTypes.object.isRequired,
  state: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const SubcategoryDrawer = ({ categoria, subcategorias, seleccionadas, onToggle, open, onOpenChange }) => {
  if (!open || !categoria) return null;

  const getCheckState = (id, isParent = false) => {
    if (isParent) {
      const childrenIds = subcategorias.map((c) => c.id);
      if (childrenIds.length === 0) return seleccionadas.has(id) ? "checked" : "unchecked";
      const selectedCount = childrenIds.filter((childId) => seleccionadas.has(childId)).length;
      if (selectedCount === 0) return "unchecked";
      if (selectedCount === childrenIds.length) return "checked";
      return "partial";
    }
    return seleccionadas.has(id) ? "checked" : "unchecked";
  };

  return createPortal(
    <React.Fragment>
      <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={() => onOpenChange(false)} />
      <div className={`drawer-container ${open ? "open" : ""}`}>
        <div className="drawer-handle" />
        <h2>
          {categoria.emoji} {categoria.nombre}
        </h2>
        <ul className="selection-list">
          <SelectionItem item={categoria} state={getCheckState(categoria.id, true)} onToggle={onToggle} />
          {subcategorias.map((sub) => (
            <SelectionItem key={sub.id} item={sub} state={getCheckState(sub.id, false)} onToggle={onToggle} />
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
