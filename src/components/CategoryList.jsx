import React from "react";
import PropTypes from "prop-types";
import CategoryItem from "./CategoryItem";

const CategoryList = ({ categorias, seleccionadas, onToggle }) => {
  const categoriasPorPadre = categorias.reduce((acc, cat) => {
    const padreId = cat.padre_id || "principales";
    if (!acc[padreId]) acc[padreId] = [];
    acc[padreId].push(cat);
    return acc;
  }, {});

  const categoriasPrincipales = categoriasPorPadre["principales"] || [];

  return (
    <ul className="category-list">
      {categoriasPrincipales.map((cat) => (
        <CategoryItem
          key={cat.id}
          categoria={cat}
          subcategorias={categoriasPorPadre[cat.id] || []}
          seleccionadas={seleccionadas}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
};

CategoryList.propTypes = {
  categorias: PropTypes.array.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CategoryList;
