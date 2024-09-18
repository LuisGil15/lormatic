import React, { useEffect, useState } from "react";
import Strength from "./Strength";
import Shield from "./Shield";

import galery from "../../data/galery.json";

import '../../assets/styles/components/atoms/Card.css';

const Card = ({ properties, className, onClick, showPrp}) => {
    const [imagePath, setImagePath] = useState(null);
    const [isFlipped, setFlipped] = useState(properties ? properties.flipped : false);
    const [cardNumber, setCardNumber] = useState(properties ? properties.cardNumber : 0);
    const [name, setName] = useState(properties ? properties.name : "");

    const getImagePath = (id) => {
        if (id === null) return null;

        const path = galery.find(c => c.cardNumber === id);
        return path ? path.imagePath : null;
    }

    useEffect(() => {
        setImagePath(
          getImagePath(
            properties ? properties.cardNumber : null
          )
        );
    }, []);

    useEffect(() => {
      setFlipped(properties ? properties.flipped : false);
      setCardNumber(properties ? properties.cardNumber : 0);
      setName(properties ? properties.name : "");
    }, [properties]);

    return (
      <div
        className={`body-card 
                ${!isFlipped ? "flipped" : "notFlipped"}  
                ${className ? className : ""}`}
        onClick={(e) => {e.stopPropagation(e); onClick && onClick()}}
      >
        {cardNumber != null && imagePath != null && (
          <img
            alt={name}
            src={require(`../../${imagePath}`)}
            className="front-card"
          />
        )}
        <img
          src={require(`../../assets/images/cardBack.jpg`)}
          class="back-card"
          alt="Back"
        />
        <div className={`inner-card`}>
          {showPrp &&
            isFlipped &&
            properties &&
            properties.type === "character" && (
              <div>
                <Shield
                  value={properties.defense - properties.damage}
                />
                <Strength value={properties.strength} />
              </div>
            )}
        </div>
      </div>
    );
};

export default Card;