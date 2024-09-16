import React from "react";

import '../../assets/styles/components/atoms/Strength.css';

const Strength = ({value}) => {
    return (
        <div className="strength-container">
            <div className="strength-bg">
                <span className="strng-txt">{value && value}</span>
            </div>
        </div>
    );
};

export default Strength;