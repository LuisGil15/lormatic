import React, { useState, useEffect } from 'react';

import '../../assets/styles/components/molecules/PlayerCounter.css'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PlayerCounter = ({ lore, id, onClick }) => {
    const [glowInk, setGlowInk] = useState(false);

    const handleLore = (delta) => {
        const newCount = lore + delta;

        onClick({ id: id, lore: newCount >= 0 ? newCount : lore });
    }

    const handleGlow = async () => {
        setGlowInk(true);

        await sleep(200);

        setGlowInk(false);
    };

    useEffect(() => {
        handleGlow();
    }, [lore]);

    return (
        <div className="player-container">
            <div className="player-counter-container">
                <button onClick={() => handleLore(-1)} className="counter-button">
                    -
                </button>
                <div className="player-counter">
                    <span className={`player-counter-lore ${glowInk && "glow-lore"}`}>{lore}</span>
                </div>
                <button onClick={() => handleLore(1)} className="counter-button">
                    +
                </button>
            </div>
            <span className="player-num">Jugador {id}</span>
        </div>
    );
}

export default PlayerCounter;