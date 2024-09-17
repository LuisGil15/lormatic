import React from "react";

import '../../assets/styles/components/molecules/DamageCounter.css';

const DamageCounter = ({damage, onDamageClick}) => {
    const lftDamage = (e) => {
        e.stopPropagation();
        onDamageClick(-1);
    }

    const rhtDamage = (e) => {
        e.stopPropagation();
        onDamageClick(1);
    }

    return (
      <div className="damage-counter-container">
        <span className="dc-text">YOUR CHARACTER STRENGTH</span>
        <div className="dc-img-container">
          <img
            className="dc-lft-arrow"
            onClick={lftDamage}
            src={require("../../assets/images/arrow.png")}
            alt="Decrease damage"
          />
          <div className="dc-counter">
            <img
              className="dc-strength"
              src={require("../../assets/images/strength.png")}
              alt="Damage counter background"
            />
            <span className="dc-img-txt">{damage ? damage : 0}</span>
          </div>
          <img
            className="dc-rht-arrow"
            onClick={rhtDamage}
            src={require("../../assets/images/arrow.png")}
            alt="Increase damage"
          />
        </div>
      </div>
    );
};

export default DamageCounter;