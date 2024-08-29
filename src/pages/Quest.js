import React, { useState, useEffect, useReducer } from "react";
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
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_INK":
            return { ...state, ink: action.payload };
        case "SET_DECK":
            return { ...state, deck: action.payload };
        case "SET_HAND":
            return { ...state, hand: action.payload };
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
    const [lore, setLore] = useState(0);
    const [discardPile, setDiscardPile] = useState([]);
    const [playArea, setPlayArea] = useState([]);
    const [shouldDrawCards, setShouldDrawCards] = useState(false);
    const [draws, setDraws] = useState(0);
    const [playersData, setPlayersData] = useState([]);
    const [glowInk, setGlowInk] = useState(false);
    const [gameReady, setGameReady] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState("");
    const [lastState, setLastState] = useState({})

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
        const prevPlayersData = playersData;

        const newPlayersData = [
            ...playersData.filter((plyr) => plyr.id !== playerData.id),
            playerData,
        ].sort((a, b) => a.id - b.id);

        setPlayersData(newPlayersData);

        if (!newPlayersData.filter((plyr) => plyr.lore < 20).length > 0) {
            setGameOver(true);
            setWinner("Players");
            setLastState({ players: prevPlayersData, ursula: lore});
        }
    };

    const drawCard = async (num2Draw) => {
        let tmpHand = state.hand;

        for (let i = 0; i < num2Draw; i++) {
            if (state.deck.length > 0) {
                const topCard = state.deck[0];

                state.deck.shift();

                tmpHand = [...tmpHand, topCard];

                dispatch({
                    type: "SET_HAND",
                    payload: tmpHand,
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

        return cardInfo;
    };

    const setGame = () => {
        const playersArray = Array.from({ length: players }, (_, index) => ({
            id: index + 1,
            lore: 0,
        }));

        setPlayersData(playersArray);
        setPlayArea((prev) => [...prev, searchCard(50)]);

        dispatch({
            type: "SET_DECK",
            payload: deckJson.filter((carta) => carta.id !== 50),
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

    const playCard = (cardInfo) => {
        const action = cardActionsMap[cardInfo.cardNumber];
        if (action) {
            action(
                {
                    lore,
                    handleLoreChange,
                    //ink,
                    //setInk,
                    playersData,
                    setPlayersData,
                },
                cardInfo
            );
        } else {
            console.log(`Card action not found ${cardInfo.name}`);
        }
    };

    const resolvePlayArea = () => {
        for (let i = 0; i < playArea.length; i++) {
            playCard(playArea[i]);
            updateCardExerted(playArea[i].id, true);
        }
    };

    const updateCardExerted = (cardId, exertedValue) => {
        const updatedPlayArea = playArea.map((card) => {
            if (card.id === cardId) {
                return {
                    ...card,
                    exerted: exertedValue,
                };
            }

            return card;
        });

        setPlayArea(updatedPlayArea);
    };

    const resolveHand = async (tmpHand, tmpInk) => {
        if (tmpHand.length > 0) {
            const tmpCard = { ...tmpHand[tmpHand.length - 1], flipped: true };

            dispatch({
                type: "SET_HAND",
                payload: [...tmpHand.slice(0, -1), tmpCard],
            });

            await sleep(1000);

            dispatch({
                type: "SET_HAND",
                payload: tmpHand.slice(0, -1),
            });

            if (tmpInk >= tmpCard.inkCost) {
                if (tmpCard.type === "item" || tmpCard.type === "character") {
                    setPlayArea((prev) => [...prev, tmpCard]);
                } else {
                    setDiscardPile((prev) => [...prev, tmpCard]);
                }

                await sleep(1000);

                resolveHand(tmpHand.slice(0, -1), tmpInk);
            } else {
                handleInk();

                dispatch({
                    type: "SET_INK",
                    payload: Math.max(tmpInk + 1, 0),
                });

                await sleep(1000);

                resolveHand(tmpHand.slice(0, -1), tmpInk + 1);
            }
        }
    };

    const setPlayAreaReady = () => {
        playArea.map((card) => card.exerted = false);
    }

    const continueGame = () => {
        setPlayersData(lastState.players);
        setLore(lastState.ursula);
        setGameOver(false);
    }

    useEffect(() => {
        //If you enter direct to quest skiping game settings, redirect to home
        if (players < 1) navigate("/");

        //Set draw number depends on players and difficult
        setDraws(getDraws());

        //Shuffle cards and set on deck
        dispatch({
            type: "SET_DECK",
            payload: shuffleDeck(deckJson),
        });

        //Set game at the begin
        if (playArea.length === 0) setGame();

        setShouldDrawCards(true);
    }, []);

    useEffect(() => {
        if (gameReady) {
            resolvePlayArea();
        }
    }, [gameReady]);

    useEffect(() => {
        const drawCardsWithDelay = async () => {
            drawCard(draws);

            setShouldDrawCards(false);
        };

        if (shouldDrawCards) {
            drawCardsWithDelay();
        }
    }, [shouldDrawCards]);

    useEffect(() => {
        if (lore >= 40) {
            setGameOver(true);
            setWinner("Ursula");
            setLastState({ players: playersData, ursula: lore - 1});
        }
    }, [lore]);

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
                <CarruselCounter lore={lore} apper={glowInk} />
            </div>
            <div className="middle-zone">
                <div className="first-column">
                    <div className="discard-zone">
                        {discardPile.length > 0 ? (
                            discardPile.map((card) => {
                                return <Card key={card.id} properties={card}></Card>;
                            })
                        ) : (
                            <div className="discard">
                                <span>DISCARD</span>
                            </div>
                        )}
                    </div>
                    <div className="deck-zone" onClick={() => drawCard(1)}>
                        {state.deck.length > 0 ? (
                            <Card></Card>
                        ) : (
                            <div className="deck">
                                <span>DECK</span>
                            </div>
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
                                    />
                                );
                            })
                        ) : (
                            <div className="hand">
                                <span>HAND</span>
                            </div>
                        )}
                    </div>
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
                    {playArea.length > 0 ? (
                        playArea.map((card) => {
                            return (
                                <Card
                                    key={"game" + card.id}
                                    properties={card}
                                    className={"card-animated"}
                                />
                            );
                        })
                    ) : (
                        <span></span>
                    )}
                    <Button onClick={() => resolveHand(state.hand, state.ink)}>
                        Resolve hand
                    </Button>
                    <Button onClick={() => resolvePlayArea()}>Resolve game zone</Button>
                    <Button onClick={() => setPlayAreaReady()}>Game zone ready</Button>
                </div>
            </div>
            <Modal show={gameOver} onClose={() => continueGame()} >
                <GameFinished lore={lore} winner={winner} />
            </Modal>
        </div>
    );
};

export default Quest;
