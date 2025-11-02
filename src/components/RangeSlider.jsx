import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

const RangeSlider = ({ min, max, step, value, onChange }) => {
  const [minVal, setMinVal] = useState(value.min);
  const [maxVal, setMaxVal] = useState(value.max);
  const range = useRef(null);

  const getPercent = useCallback((value) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

  useEffect(() => {
    setMinVal(value.min);
    setMaxVal(value.max);
  }, [value]);

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  const handleMouseUp = () => {
    onChange({ min: minVal, max: maxVal });
  };

  return (
    <div className="range-slider-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - step);
          setMinVal(value);
        }}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="thumb thumb-left"
        style={{ zIndex: minVal > max - 100 ? "5" : "3" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + step);
          setMaxVal(value);
        }}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="thumb thumb-right"
      />
      <div className="slider">
        <div className="slider-track" />
        <div ref={range} className="slider-range" />
      </div>
    </div>
  );
};

RangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  value: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RangeSlider;
