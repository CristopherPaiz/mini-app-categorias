import React from "react";
import PropTypes from "prop-types";

const SkeletonLoader = ({ items = 8 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skeleton-card" />
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  items: PropTypes.number,
};

export default SkeletonLoader;
