import React, { useEffect, useState } from "react";

import "../../assets/styles/components/molecules/CarruselCounter.css";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CarruselCounter = ({ lore, apper }) => {
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
        </div>
      </div>
    );
};

export default CarruselCounter;