import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Button from "../atoms/Button";

import "../../assets/styles/components/molecules/GameSettings.css";

const GameSettings = ({ onSubmit }) => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState(2);
    const [difficulty, setDifficulty] = useState("Facil");

    const handlePlayersChange = (delta) => {
        setPlayers((prev) => {
            const newCount = prev + delta;
            return newCount >= 1 && newCount <= 4 ? newCount : prev;
        });
    };

    const handleDifficultyChange = (level) => {
        setDifficulty(level);
    };

    const handleSubmit = () => {
        navigate("/lormatic/quest", { state: { players, difficulty } });
    };

    return (
        <div className="game-settings">
            <h2>ILLUMINEER'S QUEST</h2>
            <p>Deep Trouble</p>
            <div className="section">
                <p>Jugadores</p>
                <div className="players-control background">
                    <Button
                        className={`players-button ${players === 1 ? "disabled" : ""
                            }`}
                        onClick={() => handlePlayersChange(-1)}
                    >
                        -
                    </Button>
                    <span>{players}</span>
                    <Button
                        className={`players-button ${players === 4 ? "disabled" : ""
                            }`}
                        onClick={() => handlePlayersChange(1)}
                    >
                        +
                    </Button>
                </div>
            </div>
            <div className="section">
                <p>Dificultad</p>
                <div className="difficulty-options">
                    {["Facil", "Normal", "Dificil", "Extremo"].map((level) => (
                        <div
                            key={level}
                            className={`difficulty-option ${difficulty === level ? "selected" : ""
                                }`}
                            onClick={() => handleDifficultyChange(level)}
                        >
                            {level}
                        </div>
                    ))}
                </div>
            </div>
            <Button className="start-button-settings" onClick={handleSubmit}>
                EMPEZAR NUEVO JUEGO
            </Button>
        </div>
    );
};

export default GameSettings;
