import React, { useState } from 'react';

import '../../assets/styles/components/molecules/PlayerCounter.css'

const PlayerCounter = ({ lore, id, onClick }) => {

    const handleLore = (delta) => {
        const newCount = lore + delta;

        onClick({id: id, lore: newCount >= 0 ? newCount : lore});
    }

    return (
      <div className="player-container">
        <div className="player-counter-container">
          <button onClick={() => handleLore(-1)} className="counter-button">
            -
          </button>
          <div className="player-counter">
            <span className="player-counter-lore">{lore}</span>
          </div>
          <button onClick={() => handleLore(1)} className="counter-button">
            +
          </button>
        </div>
        <span className="player-num">Player {id}</span>
      </div>
    );
}

export default PlayerCounter;