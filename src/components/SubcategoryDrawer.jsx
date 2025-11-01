import React from "react";
import PropTypes from "prop-types";
import { Drawer } from "vaul";

const SubcategoryDrawer = ({ categoria, subcategorias, seleccionadas, onToggle, open, onOpenChange }) => {
  if (!categoria) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }} />
        <Drawer.Content className="drawer-content">
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
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
