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
            setLastState({ players: prevPlayersData, ursula: lore });
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

    const sendToQuest = async () => {
        const playAreaTmp = [...state.playArea];
        let tmpLore = lore;

        if (playAreaTmp.length == 0) {
            return;
        }

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
                    // Si la carta tiene el número 30, elimínala del playArea
                    const updatedPlayArea = playAreaTmp.filter(card => card.id !== cardTmp.id);

                    // Mueve la carta al discardPile
                    setDiscardPile((prev) => [...prev, cardTmp]);

                    // Despacha el nuevo array actualizado
                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea
                    });

                    // Asegura que el array se actualice en el estado
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
        if (tmpHand.length > 0) {
            const tmpCard = { ...tmpHand[tmpHand.length - 1], flipped: true };

            if (tmpCard.cardNumber === 17 && tmpInk <= 6) {
                tmpCard.init = false;
            }

            dispatch({
                type: "SET_HAND",
                payload: [...tmpHand.slice(0, -1), tmpCard]
            });

            await sleep(500);

            setActiveCard(tmpCard);

            dispatch({
                type: "SET_HAND",
                payload: tmpHand.slice(0, -1)
            });

            if (tmpInk >= tmpCard.inkCost && tmpCard.init === false) {
                await sleep(2000);
                setActiveCard(null);

                if (tmpCard.type === "item" || tmpCard.type === "character") {
                    if (tmpCard.bodyguard) {
                        tmpCard.exerted = true;
                    }

                    if (tmpCard.cardNumber === 12) {
                        playCard(tmpCard, true);
                    }

                    tmpPlayArea = [...tmpPlayArea, tmpCard];

                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: tmpPlayArea
                    });

                } else {
                    playCard(tmpCard, true);
                    setDiscardPile((prev) => [...prev, tmpCard]);
                }

                await sleep(1000);

                if (tmpHand.length - 1 > 0) {
                    resolveHand(tmpHand.slice(0, -1), tmpInk, tmpPlayArea);
                } else {
                    setIsPlaying(false);
                }
            } else if (tmpInk === 0 || tmpInk < tmpCard.inkCost || tmpCard.init === false) {
                await sleep(2000);
                setActiveCard(null);

                handleInk();

                dispatch({
                    type: "SET_INK",
                    payload: Math.max(tmpInk + 1, 0)
                });

                await sleep(1000);

                if (tmpHand.length - 1 > 0) {
                    resolveHand(tmpHand.slice(0, -1), tmpInk + 1, tmpPlayArea);
                } else {
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
        setGameOver(false);
    }

    const getTotalLore = () => {
        let total = 0;

        for (let i = 0; i < playersData.length; i++) {
            total += playersData[i].lore;
        }

        return total;
    }

    const resolveActiveCard = (activeCardTmp) => {
        if (state.ink >= activeCardTmp.inkCost) {
            setActiveCard(null);

            if (activeCardTmp.type === "item" || activeCardTmp.type === "character") {
                if (activeCardTmp.bodyguard) {
                    activeCardTmp.exerted = true;
                }

                dispatch({
                    type: "SET_PLAY_AREA",
                    payload: [...state.playArea, activeCardTmp]
                });
            } else {
                playCard(activeCardTmp, true);

                if (
                    activeCardTmp.cardNumber !== 20 &&
                    activeCardTmp.cardNumber !== 25
                ) {
                    setDiscardPile((prev) => [...prev, activeCardTmp]);
                }
            }
        } else {
            setActiveCard(null);

            handleInk();

            dispatch({
                type: "SET_INK",
                payload: Math.max(state.ink + 1, 0)
            });
        }

        if (state.hand.length > 0) {
            resolveHand(state.hand, state.ink, state.playArea);
        } else {
            setIsPlaying(false);
        }
    }

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
        if (gameReady) {
            resolvePlayArea();
        }
    }, [gameReady]);

    useEffect(() => {
        const drawCardsWithDelay = async () => {
            await drawCard(draws);

            setShouldDrawCards(false);
        };

        if (shouldDrawCards ) {
            drawCardsWithDelay();
        } 

        if (!isPlaying && turn && gameReady && state.hand.length > 0 && !shouldDrawCards) {
            setIsPlaying(true);
            resolveHand(state.hand, state.ink, state.playArea);
        }
    }, [shouldDrawCards]);

    useEffect(() => {
        if (lore >= 40) {
            setGameOver(true);
            setWinner("Ursula");
            setLastState({ players: playersData, ursula: lore - 1 });
        }
    }, [lore]);

    useEffect(() => {
        if (isPlaying == false && turn) {
            sendToQuest();
        }
    }, [isPlaying]);

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
          <CarruselCounter lore={lore} apper={glowInk} />
        </div>
        <div className="middle-zone">
          <div className="first-column">
            <div className="discard-zone">
              {discardPile.length > 0 ? (
                <Card
                  key={"discard" + discardPile[discardPile.length - 1].id}
                  properties={discardPile[discardPile.length - 1]}
                />
              ) : (
                <div className="discard">
                  <span>DISCARD</span>
                </div>
              )}
            </div>
            <div className="deck-zone" onClick={() => drawCard(1)}>
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
            {activeCard && (
              <div className="overlay">
                <Card properties={activeCard} className="preview-card" />
                {activeCard.init && state.ink >= activeCard.inkCost && (
                  <Button
                    className={"resolve-button"}
                    onClick={() => resolveActiveCard(activeCard)}
                  >
                    <span>RESOLVE</span>
                  </Button>
                )}
              </div>
            )}
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
                    className={`${
                      isPlaying && !card.ready ? "card-animated" : ""
                        } ${card.exerted ? "exerted" : ""}
                        ${
                        !card.ready &&
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
        <Modal show={gameOver} onClose={() => continueGame()}>
          <GameFinished
            lore={winner === "Ursula" ? lore : getTotalLore()}
            winner={winner}
          />
        </Modal>
      </div>
    );
};

export default Quest;
