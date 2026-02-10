import React from "react";
import Barcode from "react-barcode";
import PropTypes from "prop-types";
import "./CodeDisplay.css";

export default function CodeDisplay({ code, format }) {
  return (
    <div className="barcode-card">
      <h3>Generated Barcode</h3>
      <Barcode value={code} format={format} height={80} />
      <p className="barcode-text">{code}</p>
    </div>
  );
}

CodeDisplay.propTypes = {
  code: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired
};
