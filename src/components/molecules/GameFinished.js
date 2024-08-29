import React from "react";
import { useNavigate } from "react-router-dom";

import "../../assets/styles/components/molecules/GameFinished.css";

const GameFinished = ({ lore, winner }) => {
    const navigate = useNavigate();

    const finishGame = () => {
        navigate("/");
    }

    return (
      <div className="game-over-message">
        <div className={winner === "Ursula" ? "counter" : "player-counter"}>
          <span className="lore-game-over">{lore}</span>
        </div>
        <span className="winner">
          {winner === "Ursula" ? "Ursula wins" : "Game won"}
        </span>
        <span className="tittle">
          {winner === "Ursula" ? "GAME OVER!" : "CONGRATULATIONS!"}
        </span>
        <span className={"quitButton"} onClick={() => finishGame()}>
          Quit {">"}
        </span>
      </div>
    );
}

export default GameFinished;