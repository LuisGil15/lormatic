import React, { useState, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import CarruselCounter from "../components/molecules/CarruselCounter";
import PlayerCounter from "../components/molecules/PlayerCounter";
import Modal from "../components/molecules/Modal";
import GameFinished from "../components/molecules/GameFinished";
import DamageCounter from "../components/molecules/DamageCounter";

import deckJson from "../data/deck.json";

import { cardActionsMap } from "../store/actions";

import "../assets/styles/pages/Quest.css";

const initialState = {
    ink: 10,
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
    const [makeDamage, setMakeDamage] = useState(false);
    const [damageAmount, setDamageAmount] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [showDiscardPile, setShowDiscardPile] = useState(false);

    const handleLoreChange = (delta) => {
        if (difficulty !== "Facil") {
            let initialDraws = 0;
            let drawIncrement = 0;
            let drawIncrementsAtLore = [];

            switch (playersData.length) {
                case 1:
                    switch (difficulty) {
                        case "Facil":
                            initialDraws = 2;
                            break;
                        case "Normal":
                            initialDraws = 2;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [20];
                            break;
                        case "Dificil":
                        case "Extremo":
                            initialDraws = 3;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [20];
                            break;
                        default:
                            break;
                    }
                    break;
                case 2:
                    switch (difficulty) {
                        case "Facil":
                            initialDraws = 2;
                            break;
                        case "Normal":
                        case "Dificil":
                        case "Extremo":
                            initialDraws = 2;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [10, 30];
                            if (difficulty === "Dificil" || difficulty === "Extremo") {
                                initialDraws = 3;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 3:
                    switch (difficulty) {
                        case "Facil":
                            initialDraws = 3;
                            break;
                        case "Normal":
                        case "Extremo":
                            initialDraws = 3;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [20];
                            break;
                        case "Dificil":
                            initialDraws = 4;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [20];
                            break;
                        default:
                            break;
                    }
                    break;
                case 4:
                    switch (difficulty) {
                        case "Facil":
                            initialDraws = 3;
                            break;
                        case "Normal":
                        case "Dificil":
                        case "Extremo":
                            initialDraws = 3;
                            drawIncrement = 1;
                            drawIncrementsAtLore = [10, 30];
                            if (difficulty === "Dificil" || difficulty === "Extremo") {
                                initialDraws = 4;
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }

            let totalDraws = initialDraws;
            for (let i = 0; i < drawIncrementsAtLore.length; i++) {
                if (lore + delta >= drawIncrementsAtLore[i]) {
                    totalDraws += drawIncrement;
                }
            }

            setDraws(totalDraws);
        }

        setLore((prev) => {
            const newCount = prev + delta;
            return newCount >= 0 && newCount <= 40 ? newCount : prev;
        });
    };

    const handleDamageAmount = (delta) => {

        setDamageAmount((prev) => {
            const newCount = prev + delta;
            return newCount >= 0 ? newCount : prev;
        });
    }

    const handleInk = async () => {
        setGlowInk(true);

        await sleep(300);

        setGlowInk(false);
    };

    const handlePlayer = (playerData) => {
        const prevPlayersData = [...playersData];

        const newPlayersData = [
            ...playersData.filter((plyr) => plyr.id !== playerData.id),
            playerData
        ].sort((a, b) => a.id - b.id);

        setPlayersData(newPlayersData);
        console.log("Old player data: ");
        console.log(prevPlayersData);
        console.log("New player data: ");
        console.log(newPlayersData);

        if (!newPlayersData.filter((plyr) => plyr.lore < 20).length > 0) {
            setLastState({ players: prevPlayersData, ursula: lore });
            setShowModal(true);
            setGameOver(true);
            setWinner("Players");
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

    const handleChallenge = (e) => {
        e.stopPropagation();

        if (!makeDamage) {
            setMakeDamage(true);
        } else {
            if ((damageAmount >= activeCard.defense) || (activeCard.damage + damageAmount >= activeCard.defense)) {
                setBanishedCard({ ...activeCard });
                setActiveCard(null);
            } else {
                const currentDmg = activeCard.damage;
                const tmpCard = { ...activeCard, damage: currentDmg + damageAmount };
                const tmpPlayArea = [...state.playArea];
                const updatedPlayArea = tmpPlayArea.map((card) => {
                    if (card.id === tmpCard.id) {
                        return { ...tmpCard }
                    }

                    return card;
                });

                dispatch({
                    type: "SET_PLAY_AREA",
                    payload: updatedPlayArea
                });
            }

            setActiveCard(null);
            setDamageAmount(0);
            setMakeDamage(false);
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
            1: { Facil: 2, Normal: 2, Dificil: 3, Extremo: 3 },
            2: { Facil: 2, Normal: 2, Dificil: 3, Extremo: 3 },
            3: { Facil: 3, Normal: 3, Dificil: 4, Extremo: 4 },
            4: { Facil: 3, Normal: 3, Dificil: 4, Extremo: 4 },
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
        !gameOver && setShowOverlay(true);
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

            await sleep(1000);
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
                return { ...card, exerted: true }
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

        if (activeCard === null && confirmExert) {
            setConfirmExert(false);
        }

        if (activeCard === null && makeDamage) {
            setDamageAmount(0);
            setMakeDamage(false);
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

    useEffect(() => {
        if (showOverlay) {
          setIsFadingOut(false);

          const showTimer = setTimeout(() => {
            setIsFadingOut(true);
          }, 1000);

          const hideTimer = setTimeout(() => {
            setShowOverlay(false);
            setIsFadingOut(false);
          }, 2000);

          return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
          };
        }
    }, [showOverlay]);

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
    window.discardPile = discardPile;

    return (
      <div className="quest-container">
        <div className="draws-container">
          <span className="lore-text">SACAR</span>
          <div className="draws">
            <div className="draws-inner">
              <span>{draws}</span>
            </div>
          </div>
        </div>
        <div className={`ink-container ${glowInk ? "apper" : ""}`}>
          <span className="lore-text">TINTERO</span>
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
          <CarruselCounter
            lore={lore}
            apper={glowInk}
            handleLoreChange={handleLoreChange}
          />
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
                  onClick={() =>
                    discardPile.length > 0 && setShowDiscardPile(true)
                  }
                />
              ) : (
                <div className="discard">
                  <span>PILA DE</span>
                  <span>DESCARTE</span>
                </div>
              )}
            </div>
            <div className="deck-zone">
              {state.deck.length > 0 ? (
                <Card />
              ) : (
                <div className="deck">
                  <span>MAZO</span>
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
                  <span>MANO</span>
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
                <span>TERMINAR TURNO</span>
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
                    className={`game-card ${
                      isPlaying && !card.ready ? "card-animated" : ""
                    } 
                                        ${
                                          banishedCard &&
                                          card.id === banishedCard.id
                                            ? "banished-card"
                                            : ""
                                        }
                                        ${
                                          card.exerted &&
                                          (!banishedCard ||
                                            card.id !== banishedCard.id)
                                            ? "exerted"
                                            : ""
                                        }
                                        ${
                                          !card.ready &&
                                          card.type !== "item" &&
                                          !card.exerted
                                            ? "grayscale-image"
                                            : ""
                                        }`}
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
        {showDiscardPile && (
          <div
            className={`turn-overlay ${isFadingOut ? "fade-out" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDiscardPile(false);
            }}
          >
            <div className="discard-table">
              <div className="discard-table-top">
                {discardPile.map((card) => {
                  return (
                    <Card
                      key={"dct" + card.id}
                      properties={{ ...card, flipped: true }}
                      onClick={() => setActiveCard({ ...card, flipped: true })}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {activeCard && (
          <div
            className="overlay"
            onClick={() => (!turn || showDiscardPile) && setActiveCard(null)}
          >
            <Card
              properties={activeCard}
              className={`preview-card ${
                turn || showDiscardPile ? "animated-preview" : ""
              }`}
              showPrp={true}
            />
            {!showDiscardPile &&
              activeCard.init &&
              state.ink >= activeCard.inkCost &&
              turn && (
                <Button
                  className={"resolve-button"}
                  onClick={() => resolveActiveCard(activeCard)}
                >
                  <span>RESOLVER</span>
                </Button>
              )}
            {makeDamage && (
              <DamageCounter
                damage={damageAmount}
                onDamageClick={(e) => handleDamageAmount(e)}
              />
            )}
            {!turn && !showDiscardPile && (
              <div className="duel-zone">
                {
                  <Button onClick={handleBanish}>
                    <span>
                      {confirmBanish ? "CONFIRMAR DESTIERRO" : "DESTERRAR"}
                    </span>
                  </Button>
                }
                {activeCard.type === "character" && activeCard.exerted ? (
                  <Button onClick={handleChallenge}>
                    <span>{makeDamage ? "CONFIRMAR" : "DESAFIAR"}</span>
                  </Button>
                ) : (
                  activeCard.type === "character" && (
                    <Button onClick={handleExert}>
                      <span>{confirmExert ? "CONFIRMAR AGOTAR" : "AGOTAR"}</span>
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        )}
        {showOverlay && (
          <div className={`turn-overlay ${isFadingOut ? "fade-out" : ""}`}>
            <div className="turn-overlay-message">TU TURNO!!!</div>
          </div>
        )}
      </div>
    );
};

export default Quest;
