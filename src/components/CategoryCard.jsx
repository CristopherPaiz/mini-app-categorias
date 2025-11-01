import React from "react";
import PropTypes from "prop-types";

const CategoryCard = ({ categoria, state, onClick }) => {
  return (
    <div className={`category-card ${state}`} onClick={onClick}>
      <div className="emoji">{categoria.emoji}</div>
      <div className="name">{categoria.nombre}</div>
    </div>
  );
};

CategoryCard.propTypes = {
  categoria: PropTypes.object.isRequired,
  state: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CategoryCard;
