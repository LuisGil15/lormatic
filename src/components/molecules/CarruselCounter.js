import React, { useEffect, useState } from "react";

import "../../assets/styles/components/molecules/CarruselCounter.css";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CarruselCounter = ({ lore, apper, handleLoreChange }) => {
    const [glowInk, setGlowInk] = useState(false);

    const handleLore = async () => {
      setGlowInk(true);

      await sleep(200);

      setGlowInk(false);
    };

    useEffect(() => {
        handleLore(true);
    }, [lore]);

    return (
      <div className="counter-body">
        <div className="sides left-side">
          {lore > 0 && (
            <div className="left-arrow" onClick={() => handleLoreChange(-1)}>
              <img
                className="left-arrow-img"
                src={require("../../assets/images/arrow.png")}
                alt="Decrease lore"
              />
            </div>
          )}
          {[...Array(5)].map((_, i) => {
            const value = lore - (5 - i);
            return (
              <span
                key={i}
                className={`number 
                                ${
                                  value % 10 === 0 && value !== 0
                                    ? "special"
                                    : ""
                                }`}
              >
                {value >= 0 ? value : ""}
              </span>
            );
          })}
        </div>
        <div className={`counter ${glowInk ? "apper" : ""}`}>
          <span>{lore}</span>
        </div>
        <div className="sides right-side">
          {[...Array(5)].map((_, i) => {
            const value = lore + i + 1;

            return (
              <span
                key={i}
                className={`number ${value % 10 === 0 ? "special" : ""}`}
              >
                {value <= 40 ? value : ""}
              </span>
            );
          })}
          {lore < 40 && (
            <div className="right-arrow" onClick={() => handleLoreChange(1)}>
              <img
                className="right-arrow-img"
                src={require("../../assets/images/arrow.png")}
                alt="Increase lore"
              />
            </div>
          )}
        </div>
      </div>
    );
};

export default CarruselCounter;