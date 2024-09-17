import React, { useEffect, useState, useReducer } from "react";
import Strength from "./Strength";
import Shield from "./Shield";

import galery from "../../data/galery.json";

import '../../assets/styles/components/atoms/Card.css';

const initialState = {
    imagePath: ""
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_IMAGE_PATH":
      return { ...state, imagePath: action.payload };
    default:
      return state;
  }
};

const Card = ({ properties, className, onClick, showPrp}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [cardProperties] = useState(properties);
    const [isFlipped, setFlipped] = useState(properties ? properties.flipped : false);
    const [cardNumber, setCardNumber] = useState(properties ? properties.cardNumber : 0);
    const [name, setName] = useState(properties ? properties.name : "");

    const getImagePath = (id) => {
        if (id === null) return null;

        const path = galery.find(c => c.cardNumber === id);
        return path ? path.imagePath : null;
    }

    useEffect(() => {
        dispatch({
          type: "SET_IMAGE_PATH",
          payload: getImagePath(
            cardProperties ? cardProperties.cardNumber : null
          ),
        });
    }, []);

    useEffect(() => {
      setFlipped(cardProperties ? cardProperties.flipped : false);
      setCardNumber(cardProperties ? cardProperties.cardNumber : 0);
      setName(cardProperties ? cardProperties.name : "");
    }, [cardProperties]);

    return (
      <div
        className={`body-card 
                ${!isFlipped ? "flipped" : "notFlipped"}  
                ${className ? className : ""}`}
        onClick={() => onClick && onClick()}
      >
        {cardNumber != null && state.imagePath != null && (
          <img
            alt={name}
            src={require(`../../${state.imagePath}`)}
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
            cardProperties &&
            cardProperties.type === "character" && (
              <div>
                <Shield
                  value={cardProperties.defense - cardProperties.damage}
                />
                <Strength value={cardProperties.strength} />
              </div>
            )}
        </div>
      </div>
    );
};

export default Card;