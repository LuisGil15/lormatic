import React, { useEffect, useState } from 'react';

import galery from "../../data/galery.json";

import '../../assets/styles/components/atoms/Card.css';

const Card = ({ properties, className, onClick }) => {
    const [isFlipped, setFlipped] = useState(properties ? properties.flipped : false);
    const [cardNumber, setCardNumber] = useState(properties ? properties.cardNumber : 0);
    const [name, setName] = useState(properties ? properties.name : "");
    const [imagePath, setImagePath] = useState("");

    const getImagePath = (id) => {
        const path = galery.find(c => c.cardNumber === id);
        return path ? path.imagePath : null;
    }

    useEffect(() => {
        setImagePath(getImagePath(cardNumber));
    }, []);

    useEffect(() => {
        setFlipped(properties ? properties.flipped : false);
        setCardNumber(properties ? properties.cardNumber : 0);
        setName(properties ? properties.name : "");
     }, [properties]);

    return (
        <div
            className={`body-card 
                ${isFlipped ? "flipped" : ""}  
                ${className ? className : ""}`}
            onClick={() => onClick && onClick()}
        >
            {cardNumber != null && imagePath != null && isFlipped ?
                <img
                    alt={name}
                    src={require(`../../${imagePath}`)}
                    className="img-card"
                />
            : <span></span>}
        </div>
    );
};

export default Card;