import React from "react";
import PropTypes from "prop-types";

const SkeletonLoader = ({ items = 5 }) => {
  return (
    <div className="skeleton-loader">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skeleton-item" />
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  items: PropTypes.number,
};

export default SkeletonLoader;
