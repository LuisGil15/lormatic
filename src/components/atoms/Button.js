import React from "react";
import "../../assets/styles/components/atoms/Button.css"; // Importa los estilos específicos para el botón

const Button = ({ children, onClick, className }) => {
  return (
    <button className={`custom-button ${className}`} onClick={onClick}>
      <div className={`inner-custom-button`}>{children}</div>
    </button>
  );
};

export default Button;
