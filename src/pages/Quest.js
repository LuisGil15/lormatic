import React, { useState, useEffect, useReducer, act } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import CarruselCounter from "../components/molecules/CarruselCounter";
import PlayerCounter from "../components/molecules/PlayerCounter";
import Modal from "../components/molecules/Modal";
import GameFinished from "../components/molecules/GameFinished";

import deckJson from "../data/deck.json";

import { cardActionsMap } from "../store/actions";

import "../assets/styles/pages/Quest.css";

const initialState = {
    ink: 0,
    deck: [],
    hand: [],
    playArea: []
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INK":
            return { ...state, ink: action.payload };
        case "SET_DECK":
            return { ...state, deck: action.payload };
        case "SET_HAND":
            return { ...state, hand: action.payload };
        case "SET_PLAY_AREA":
            return { ...state, playArea: action.payload };
        default:
            return state;
    }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Quest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { players, difficulty } = location.state || {};
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showModal, setShowModal] = useState(false);
    const [confirmBanish, setConfirmBanish] = useState(false);
    const [confirmExert, setConfirmExert] = useState(false);
    const [lore, setLore] = useState(0);
    const [discardPile, setDiscardPile] = useState([]);
    const [shouldDrawCards, setShouldDrawCards] = useState(false);
    const [draws, setDraws] = useState(0);
    const [playersData, setPlayersData] = useState([]);
    const [glowInk, setGlowInk] = useState(false);
    const [gameReady, setGameReady] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState("");
    const [lastState, setLastState] = useState({});
    const [activeCard, setActiveCard] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [turn, setTurn] = useState(true);
    const [banishedCard, setBanishedCard] = useState(null);

    const handleLoreChange = (delta) => {
        setLore((prev) => {
            const newCount = prev + delta;
            return newCount >= 0 && newCount <= 40 ? newCount : prev;
        });
    };

    const handleInk = async () => {
        setGlowInk(true);

        await sleep(300);

        setGlowInk(false);
    };

    const handlePlayer = (playerData) => {
        const prevPlayersData = [...playersData];

        const newPlayersData = [
            ...playersData.filter((plyr) => plyr.id !== playerData.id),
            playerData,
        ].sort((a, b) => a.id - b.id);

        setPlayersData(newPlayersData);

        if (!newPlayersData.filter((plyr) => plyr.lore < 20).length > 0) {
            setShowModal(true);
            setGameOver(true);
            setWinner("Players");
            console.log("Prev data");
            console.log(prevPlayersData);
            setLastState({ players: prevPlayersData, ursula: lore });
        }
    };

    const handleBanish = (e) => {
        e.stopPropagation();

        if (!confirmBanish) {
            setConfirmBanish(true);
        } else {
            setBanishedCard({ ...activeCard });
            setActiveCard(null);
            setConfirmBanish(false);
        }
    };

    const handleExert = (e) => {
        e.stopPropagation();

        if (!confirmExert) {
            setConfirmExert(true);
        } else {
            exertCard(activeCard.id);
            setActiveCard(null);
            setConfirmExert(false);
        }
    };

    const drawCard = async (num2Draw) => {
        let tmpHand = state.hand;

        for (let i = 0; i < num2Draw; i++) {
            if (state.deck.length > 0 && !gameOver) {
                const topCard = state.deck[0];

                state.deck.shift();

                tmpHand = [...tmpHand, topCard];

                dispatch({
                    type: "SET_HAND",
                    payload: tmpHand
                });
            }

            await sleep(500);
        }
    };

    const shuffleDeck = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    };

    const searchCard = (id) => {
        const cardInfo = deckJson.find((c) => c.id === id);

        if (id === 50) {
            cardInfo.ready = true;
        }

        return cardInfo;
    };

    const setGame = () => {
        const playersArray = Array.from({ length: players }, (_, index) => ({
            id: index + 1,
            lore: 0,
        }));

        setPlayersData(playersArray);

        dispatch({
            type: "SET_PLAY_AREA",
            payload: [...state.playArea, searchCard(50)]
        });

        dispatch({
            type: "SET_DECK",
            payload: deckJson.filter((carta) => carta.id !== 50)
        });

        setGameReady(true);
    };

    const getDraws = () => {
        const drawsConfig = {
            1: { Easy: 2, Normal: 2, Hard: 3, Extreme: 3 },
            2: { Easy: 2, Normal: 2, Hard: 3, Extreme: 3 },
            3: { Easy: 3, Normal: 3, Hard: 4, Extreme: 4 },
            4: { Easy: 3, Normal: 3, Hard: 4, Extreme: 4 },
        };

        const draws = drawsConfig[players]?.[difficulty] || 0;

        return draws;
    };

    const playCard = (cardInfo, init) => {
        const action = cardActionsMap[cardInfo.cardNumber];

        if (action) {
            action(
                {
                    lore,
                    handleLoreChange,
                    handleInk,
                    playersData,
                    setPlayersData,
                    setActiveCard,
                    setDiscardPile,
                    ink: state.ink,
                    deck: state.deck,
                    playArea: state.playArea,
                    dispatch,
                    drawCard
                },
                cardInfo,
                init
            );
        } else {
            console.log(`Card action not found ${cardInfo.name}`);
        }
    };

    const sendToQuest = async (lastPlayArea) => {
        const playAreaTmp = [...lastPlayArea];
        let tmpLore = lore;

        for (let i = 0; i < playAreaTmp.length; i++) {
            let cardTmp = playAreaTmp[i];

            if (cardTmp.type === "character" && cardTmp.ready && !cardTmp.exerted && tmpLore <= 40) {
                handleLoreChange(cardTmp.lore);
                tmpLore += cardTmp.lore;

                dispatch({
                    type: "SET_PLAY_AREA",
                    payload: playAreaTmp.map((entry) => {
                        if (entry.id === cardTmp.id) {
                            entry.exerted = true;
                        }

                        return entry;
                    })
                });

                await sleep(1000);
            }
        }

        setTurn(false);
    };

    const readyCharacters = () => {
        dispatch({
            type: "SET_PLAY_AREA",
            payload: state.playArea.map((char) => {
                return { ...char, ready: true };
            })
        });
    }

    const resolvePlayArea = async () => {
        let playAreaTmp = [...state.playArea];

        for (let i = 0; i < playAreaTmp.length; i++) {
            let cardTmp = playAreaTmp[i];

            dispatch({
                type: "SET_PLAY_AREA",
                payload: playAreaTmp.map((entry) => {
                    if (entry.id === cardTmp.id) {
                        entry.exerted = false;
                        entry.ready = true;
                    }

                    return entry;
                })
            });

            await sleep(500);
        }

        for (let i = 0; i < playAreaTmp.length; i++) {
            // Copia del estado actual del playArea para evitar modificaciones directas
            let cardTmp = { ...playAreaTmp[i] }; // Crea una copia de la carta actual

            if (cardTmp.type === "item") {
                playCard(cardTmp, false);

                if (cardTmp.cardNumber !== 30) {
                    // Actualiza el valor de exerted solo para la carta actual
                    const updatedPlayArea = playAreaTmp.map((card) => {
                        if (card.id === cardTmp.id) {
                            return { ...card, exerted: true };
                        }
                        return card;
                    });

                    // Despacha el nuevo array actualizado
                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea
                    });

                    // Asegura que el array se actualice en el estado
                    playAreaTmp = [...updatedPlayArea];

                } else {
                    const updatedPlayArea = playAreaTmp.filter(card => card.id !== cardTmp.id);

                    setDiscardPile((prev) => [...prev, cardTmp]);

                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea
                    });

                    playAreaTmp = [...updatedPlayArea];
                }

                // Espera 700 ms antes de continuar con la siguiente carta
                await sleep(700);
            }
        }

        await sleep(500);

        setShouldDrawCards(true);
    };

    const resolveHand = async (tmpHand, tmpInk, tmpPlayArea) => {
        if (tmpHand.length > 0 && !gameOver) {
            const tmpCard = { ...tmpHand[tmpHand.length - 1], flipped: true };

            if (tmpCard.cardNumber === 17 && tmpInk <= 6) {
                tmpCard.init = false;
            }

            // Actualizar la mano con la carta modificada
            dispatch({
                type: "SET_HAND",
                payload: [...tmpHand.slice(0, -1), tmpCard]
            });

            await sleep(500);
            setActiveCard(tmpCard);

            // Eliminar la última carta de tmpHand y actualizar el estado
            const updatedHand = tmpHand.slice(0, -1); // mano actualizada sin la última carta
            dispatch({
                type: "SET_HAND",
                payload: updatedHand
            });

            if (tmpInk >= tmpCard.inkCost && tmpCard.init === false) {
                await sleep(2000);
                setActiveCard(null);

                // Verificar si la carta es de tipo "item" o "character"
                if (tmpCard.type === "item" || tmpCard.type === "character") {
                    const updatedCard = { ...tmpCard }; // Copia de la carta para evitar mutaciones

                    if (updatedCard.bodyguard) {
                        updatedCard.exerted = true; // Modificar sin mutar el original
                    }

                    if (updatedCard.cardNumber === 12) {
                        playCard(updatedCard, true); // Usamos la carta copiada
                    }

                    // Asegurar la inmutabilidad de tmpPlayArea
                    const updatedPlayArea = [...tmpPlayArea, updatedCard]; // Agregamos la carta copiada

                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea
                    });

                    // Actualizar la referencia de tmpPlayArea
                    tmpPlayArea = updatedPlayArea;
                } else {
                    playCard(tmpCard, true);
                    setDiscardPile((prev) => [...prev, tmpCard]); // Añadir la carta al descarte
                }

                await sleep(1000);

                // Continuar resolviendo la mano si quedan cartas
                if (updatedHand.length > 0) {
                    resolveHand(updatedHand, tmpInk, tmpPlayArea); // Llamar recursivamente con la mano y área actualizada
                } else {
                    sendToQuest([...tmpPlayArea]);
                    setIsPlaying(false);
                }
            } else if (tmpInk === 0 || tmpInk < tmpCard.inkCost || tmpCard.init === false) {
                await sleep(2000);
                setActiveCard(null);

                handleInk();

                dispatch({
                    type: "SET_INK",
                    payload: Math.max(tmpInk + 1, 0) // Aumentar la tinta
                });

                await sleep(1000);

                if (updatedHand.length > 0) {
                    resolveHand(updatedHand, tmpInk + 1, tmpPlayArea); // Llamar recursivamente con más ink
                } else {
                    sendToQuest([...tmpPlayArea]);
                    setIsPlaying(false);
                }
            }
        }
    };

    const setPlayAreaReady = () => {
        const playAreaTmp = [...state.playArea];

        for (let i = 0; i < playAreaTmp.length; i++) {
            let cardTmp = playAreaTmp[i];

            if (cardTmp.exerted) {

                dispatch({
                    type: "SET_PLAY_AREA",
                    payload: playAreaTmp.map((entry) => {
                        if (entry.id === cardTmp.id) {
                            entry.exerted = false;
                        }

                        return entry;
                    })
                });
            }
        }
    }

    const continueGame = () => {
        setPlayersData(lastState.players);
        setLore(lastState.ursula);
        setShowModal(false);
        setGameOver(false);
    }

    const banishCard = (cardID) => {
        let tmpPlayArea = [...state.playArea];

        dispatch({
            type: "SET_PLAY_AREA",
            payload: [...tmpPlayArea.filter((cardTmp) => cardTmp.id !== cardID)]
        });

        setDiscardPile((prev) => [...prev, { ...banishedCard }]);
        setBanishedCard(null);
    }

    const exertCard = (cardID) => {
        const tmpPlayArea = [...state.playArea];
        const updatedPlayArea = tmpPlayArea.map((card) => { 
            if (cardID === card.id) {
                return {...card, exerted: true}
            }

            return card;
        });

        dispatch({
            type: "SET_PLAY_AREA",
            payload: updatedPlayArea
        });
    }

    const getTotalLore = () => {
        let total = 0;

        for (let i = 0; i < playersData.length; i++) {
            total += playersData[i].lore;
        }

        return total;
    }

    const resolveActiveCard = (activeCardTmp) => {
        let updatedPlayArea = [...state.playArea];
        let updatedInk = state.ink;

        if (updatedInk >= activeCardTmp.inkCost) {
            setActiveCard(null);

            // Si la carta es de tipo "item" o "character"
            if (activeCardTmp.type === "item" || activeCardTmp.type === "character") {
                const updatedCard = { ...activeCardTmp }; // Crear una copia de la carta

                if (updatedCard.bodyguard) {
                    updatedCard.exerted = true; // Modificar la carta copiada
                }

                // Agregar la carta al playArea de manera inmutable
                updatedPlayArea = [...updatedPlayArea, updatedCard];

                dispatch({
                    type: "SET_PLAY_AREA",
                    payload: updatedPlayArea // Actualizar el playArea con la nueva carta
                });

            } else {
                playCard(activeCardTmp, true);

                if (
                    activeCardTmp.cardNumber !== 20 &&
                    activeCardTmp.cardNumber !== 25
                ) {
                    // Agregar la carta al descarte de manera inmutable
                    setDiscardPile((prev) => [...prev, activeCardTmp]);
                }
            }
        } else {
            setActiveCard(null);

            handleInk();
            updatedInk += 1;
            // Incrementar la cantidad de ink de manera inmutable
            dispatch({
                type: "SET_INK",
                payload: Math.max(state.ink + 1, 0)
            });
        }

        // Llamar a resolveHand solo después de haber terminado con la carta activa
        if (state.hand.length > 0) {
            resolveHand([...state.hand], updatedInk, [...updatedPlayArea]); // Pasar copias inmutables de los arrays
        } else {
            sendToQuest([...updatedPlayArea]);
            setIsPlaying(false);
        }
    };

    const drawSpecificCard = (id) => {
        let tmpHand = state.hand;

        if (state.deck.length > 0) {
            const topCard = state.deck.filter((cardTmp) => cardTmp.id === id)[0];
            console.log(topCard);
            if (topCard.id) {
                state.deck.shift();

                tmpHand = [...tmpHand, topCard];

                dispatch({
                    type: "SET_HAND",
                    payload: tmpHand
                });
            }
        }
    }

    useEffect(() => {
        if (!gameReady) {
            //If you enter direct to quest skiping game settings, redirect to home
            if (players < 1) navigate("/");

            //Set draw number depends on players and difficult
            setDraws(getDraws());

            //Shuffle cards and set on deck
            dispatch({
                type: "SET_DECK",
                payload: shuffleDeck(deckJson)
            });

            //Set game at the begin
            if (state.playArea.length === 0) setGame();
        }
    }, []);

    useEffect(() => {
        if (activeCard === null && confirmBanish) {
            setConfirmBanish(false);
        }
    }, [activeCard]);

    useEffect(() => {
        if (gameReady) {
            resolvePlayArea();
        }
    }, [gameReady]);

    useEffect(() => {
        const drawCardsWithDelay = async () => {
            await drawCard(draws);

            setShouldDrawCards(false);
        };

        if (shouldDrawCards) {
            drawCardsWithDelay();
        }

        if (!isPlaying && turn && gameReady && state.hand.length > 0 && !shouldDrawCards) {
            setIsPlaying(true);
            resolveHand(state.hand, state.ink, state.playArea);
        }
    }, [shouldDrawCards]);

    useEffect(() => {
        if (lore >= 40) {
            setShowModal(true);
            setGameOver(true);
            setWinner("Ursula");
            setLastState({ players: playersData, ursula: lore - 1 });
        }
    }, [lore]);

    // useEffect(() => {
    //     if (isPlaying == false && turn) {
    //         sendToQuest();
    //     }
    // }, [isPlaying]);

    useEffect(() => {
        if (confirmBanish) {
            const timer = setTimeout(() => setConfirmBanish(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [confirmBanish]);
    
    useEffect(() => {
        if (confirmExert) {
            const timer = setTimeout(() => setConfirmExert(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [confirmExert]);

    useEffect(() => {
        if (banishedCard !== null) {
            const timer = setTimeout(() => banishCard(banishedCard.id), 1000);
            return () => clearTimeout(timer);;
        }
    }, [banishedCard]);

    window.handleLoreChange = handleLoreChange;
    window.resolveHand = resolveHand;
    window.resolvePlayArea = resolvePlayArea;
    window.hand = state.hand;
    window.ink = state.ink;
    window.deck = state.deck;
    window.drawCard = drawCard;
    window.setActiveCard = setActiveCard;
    window.drawSpecificCard = drawSpecificCard;
    window.readyCharacters = readyCharacters;
    window.sendToQuest = sendToQuest;
    window.playArea = state.playArea;
    window.setPlayAreaReady = setPlayAreaReady;

    return (
        <div className="quest-container">
            <div className="draws-container">
                <span className="lore-text">DRAWS</span>
                <div className="draws">
                    <div className="draws-inner">
                        <span>{draws}</span>
                    </div>
                </div>
            </div>
            <div className={`ink-container ${glowInk ? "apper" : ""}`}>
                <span className="lore-text">INKWELL</span>
                <div className={`ink ${glowInk ? "apper" : ""}`}>
                    <div className="ink-inner">
                        <span>{state.ink}</span>
                    </div>
                </div>
            </div>
            <div className="title">
                <span className="lore-text">URSULA</span>
            </div>
            <div className="lore-zone">
                <CarruselCounter lore={lore} apper={glowInk} handleLoreChange={handleLoreChange} />
            </div>
            <div className="middle-zone">
                <div className="first-column">
                    <div className="discard-zone">
                        {discardPile.length > 0 ? (
                            <Card
                                key={"discard" + discardPile[discardPile.length - 1].id}
                                properties={discardPile[discardPile.length - 1]}
                                showPrp={false}
                                className={"card-animated"}
                            />
                        ) : (
                            <div className="discard">
                                <span>DISCARD</span>
                            </div>
                        )}
                    </div>
                    <div className="deck-zone">
                        {state.deck.length > 0 ? (
                            <Card />
                        ) : (
                            <div className="deck">
                                <span>DECK</span>
                            </div>
                        )}
                        {state.deck.length > 0 && (
                            <span className="deck-cards">{state.deck.length}</span>
                        )}
                    </div>
                </div>
                <div className="second-column">
                    <div className="hand-zone">
                        {state.hand.length > 0 ? (
                            state.hand.map((card) => {
                                return (
                                    <Card
                                        key={"hand" + card.id}
                                        properties={card}
                                        className={"newCard"}
                                        showPrp={false}
                                    />
                                );
                            })
                        ) : (
                            <div className="hand">
                                <span>HAND</span>
                            </div>
                        )}
                    </div>
                    {!turn && (
                        <Button
                            onClick={() => {
                                setTurn(true);
                                resolvePlayArea();
                            }}
                            className={"end-turn-btn"}
                        >
                            <span>END TURN</span>
                        </Button>
                    )}
                </div>
                <div className="third-column">
                    {playersData.map((player) => {
                        return (
                            <PlayerCounter
                                key={player.id}
                                lore={player.lore}
                                id={player.id}
                                onClick={(playerData) => handlePlayer(playerData)}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="game-zone">
                <div className="carousel">
                    {state.playArea.length > 0 ? (
                        state.playArea.map((card) => {
                            return (
                                <Card
                                    key={"game" + card.id}
                                    properties={card}
                                    onClick={() => !turn && setActiveCard(card)}
                                    showPrp={true}
                                    className={`game-card ${isPlaying && !card.ready ? "card-animated" : ""
                                        } 
                                        ${banishedCard && card.id === banishedCard.id ? "banished-card" : ""}
                                        ${card.exerted && (!banishedCard || card.id !== banishedCard.id) ? "exerted" : ""}
                                        ${!card.ready &&
                                            card.type !== "item" &&
                                            !card.exerted ? "grayscale-image" : ""}`}
                                />
                            );
                        })
                    ) : (
                        <span></span>
                    )}
                </div>
            </div>
            <Modal show={showModal} onClose={() => continueGame()}>
                <GameFinished
                    lore={winner === "Ursula" ? lore : getTotalLore()}
                    winner={winner}
                />
            </Modal>
            {activeCard && (
                <div
                    className="overlay"
                    onClick={() => !turn && setActiveCard(null)}
                >
                    <Card
                        properties={activeCard}
                        className={`preview-card ${turn ? "animated-preview" : ""}`}
                        showPrp={true}
                    />
                    {activeCard.init && state.ink >= activeCard.inkCost && turn && (
                        <Button
                            className={"resolve-button"}
                            onClick={() => resolveActiveCard(activeCard)}
                        >
                            <span>RESOLVE</span>
                        </Button>
                    )}
                    {!turn &&
                        <div className="duel-zone">
                            {
                                <Button
                                    onClick={handleBanish}
                                >
                                    <span>{confirmBanish ? "CONFIRM BANISH" : "BANISH"}</span>
                                </Button>
                            }
                            {(activeCard.type === "character" && activeCard.exerted) ?
                                <Button
                                >
                                    <span>CHALLENGE</span>
                                </Button> : activeCard.type === "character" && <Button
                                    onClick={handleExert}
                                >
                                    <span>{confirmExert ? "CONFIRM EXERT" : "EXERT"}</span>
                                </Button> 
                            }
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export default Quest;