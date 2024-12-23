import React, { useState, useEffect, useReducer, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import CarruselCounter from "../components/molecules/CarruselCounter";
import PlayerCounter from "../components/molecules/PlayerCounter";
import Modal from "../components/molecules/Modal";
import GameFinished from "../components/molecules/GameFinished";
import DamageCounter from "../components/molecules/DamageCounter";

import drawCardSound from "../assets/sounds/DrawCard.mp3";
import inkSplashSound from "../assets/sounds/InkSplash.mp3";
import flipCardSound from "../assets/sounds/FlipCard.mp3";
import damageSound from "../assets/sounds/Damage.mp3";
import banishedSound from "../assets/sounds/Banished.mp3";
import gameOverSound from "../assets/sounds/GameOver.mp3";
import winnerSound from "../assets/sounds/Winner.mp3";

import deckJson from "../data/deck.json";

import { cardActionsMap } from "../store/actions";

import "../assets/styles/pages/Quest.css";

const initialState = {
    ink: 0,
    deck: [],
    hand: [],
    playArea: [],
    liveTurn: false
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
      case "SET_LIVE_TURN":
        return { ...state, liveTurn: action.payload };
      default:
        return state;
    }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Quest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const resolveBtnRef = useRef(null);
    const endTurnBtnRef = useRef(null);
    const overlayRef = useRef(null);
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
    const [glowItems, setGlowItems] = useState(false);

    const [dev] = useState(false);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.play();
    };

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
        const audio = new Audio(inkSplashSound);

        setGlowInk(true);
        audio.play();

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
                const audio = new Audio(damageSound);
                audio.play();

                setBanishedCard({ ...activeCard });
                setActiveCard(null);
            } else {
                const currentDmg = activeCard.damage;
                const tmpCard = { ...activeCard, damage: currentDmg + damageAmount };
                const tmpPlayArea = [...state.playArea];
                const audio = new Audio(damageSound);
                const updatedPlayArea = tmpPlayArea.map((card) => {
                    if (card.id === tmpCard.id) {
                        return { ...tmpCard }
                    }

                    return card;
                });

                audio.play();

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
                const audio = new Audio(drawCardSound);
                audio.play();

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

                    const audio = new Audio(banishedSound);
                    audio.play();

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
            const audio = new Audio(flipCardSound);
            audio.play();
            
            let tmpCard = { ...tmpHand[tmpHand.length - 1], flipped: true };
            let thereItems = false;
            

            if (tmpCard.cardNumber === 17 && tmpInk <= 6) {
                tmpCard.init = false;
            }

            if (tmpCard.cardNumber === 21 && tmpPlayArea.filter((card) => card.type === "item").length > 0) {
                thereItems = true;
            }

            dispatch({
                type: "SET_HAND",
                payload: [...tmpHand.slice(0, -1), tmpCard]
            });

            await sleep(1000);
            setActiveCard(tmpCard);

            const updatedHand = tmpHand.slice(0, -1);

            dispatch({
                type: "SET_HAND",
                payload: updatedHand
            });

            if (
                tmpInk >= tmpCard.inkCost &&
                tmpCard.init === false &&
                !thereItems
            ) {
                await sleep(2000);
                setActiveCard(null);

                if (tmpCard.type === "item" || tmpCard.type === "character") {
                    const updatedCard = { ...tmpCard };

                    if (updatedCard.bodyguard) {
                        updatedCard.exerted = true;
                    }

                    if (updatedCard.cardNumber === 12) {
                        playCard(updatedCard, true);
                    }

                    const updatedPlayArea = [...tmpPlayArea, updatedCard];

                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea,
                    });

                    tmpPlayArea = updatedPlayArea;
                } else {
                    playCard(tmpCard, true);
                    
                    const audio = new Audio(banishedSound);
                    audio.play();

                    setDiscardPile((prev) => [...prev, tmpCard]);
                }

                await sleep(1000);

                if (updatedHand.length > 0) {
                    resolveHand(updatedHand, tmpInk, tmpPlayArea);
                } else {
                    sendToQuest([...tmpPlayArea]);
                    setIsPlaying(false);
                }
            } else if (
                (tmpInk === 0 ||
                    tmpInk < tmpCard.inkCost ||
                    tmpCard.init === false) &&
                !thereItems
            ) {
                await sleep(2000);
                setActiveCard(null);

                handleInk();

                dispatch({
                    type: "SET_INK",
                    payload: Math.max(tmpInk + 1, 0),
                });

                await sleep(1000);

                if (updatedHand.length > 0) {
                    resolveHand(updatedHand, tmpInk + 1, tmpPlayArea);
                } else {
                    sendToQuest([...tmpPlayArea]);
                    setIsPlaying(false);
                }
            } else {
                setActiveCard({ ...tmpCard, init: true });
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
        const audio = new Audio(banishedSound);
        const updatedPlayArea = [
            ...tmpPlayArea.filter((cardTmp) => cardTmp.id !== cardID),
        ];

        audio.play();

        dispatch({
            type: "SET_PLAY_AREA",
            payload: updatedPlayArea,
        });

        setDiscardPile((prev) => [...prev, { ...banishedCard }]);


        setBanishedCard(null);

        if (glowItems) {
            setGlowItems(false);

            if (state.hand.length > 0) {
                resolveHand(state.hand, state.ink, [...updatedPlayArea]);
            } else {
                sendToQuest([...updatedPlayArea]);
                setIsPlaying(false);
            }
        }
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

        if (activeCardTmp.cardNumber !== 21) {
            if (updatedInk >= activeCardTmp.inkCost) {
                setActiveCard(null);

                // Si la carta es de tipo "item" o "character"
                if (
                    activeCardTmp.type === "item" ||
                    activeCardTmp.type === "character"
                ) {
                    const updatedCard = { ...activeCardTmp }; // Crear una copia de la carta

                    if (updatedCard.bodyguard) {
                        updatedCard.exerted = true; // Modificar la carta copiada
                    }

                    // Agregar la carta al playArea de manera inmutable
                    updatedPlayArea = [...updatedPlayArea, updatedCard];

                    dispatch({
                        type: "SET_PLAY_AREA",
                        payload: updatedPlayArea, // Actualizar el playArea con la nueva carta
                    });
                } else {
                    playCard(activeCardTmp, true);

                    if (
                        activeCardTmp.cardNumber !== 20 &&
                        activeCardTmp.cardNumber !== 25
                    ) {
                        // Agregar la carta al descarte de manera inmutable
                        const audio = new Audio(banishedSound);
                        audio.play();
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
                    payload: Math.max(state.ink + 1, 0),
                });
            }

            // Llamar a resolveHand solo después de haber terminado con la carta activa
            if (state.hand.length > 0) {
                resolveHand([...state.hand], updatedInk, [...updatedPlayArea]); // Pasar copias inmutables de los arrays
            } else {
                sendToQuest([...updatedPlayArea]);
                setIsPlaying(false);
            }
        } else {
            setGlowItems(true);
            setActiveCard(null);

            const audio = new Audio(banishedSound);
            audio.play();

            setDiscardPile((prev) => [...prev, activeCardTmp]);
        }
    };

    const drawSpecificCard = (id) => {
        let tmpHand = state.hand;

        if (state.deck.length > 0) {
            const topCard = state.deck.filter((cardTmp) => cardTmp.id === id)[0];

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

    const clickCard = (card) => {
        if (!turn || (glowItems && card.type === "item")) {
            setActiveCard(card);
        }
    }

    const handleKey = (event) => {
        // TO DO - Some problems in implementation
        // if (event.code === "Space") {
        //     if (
        //       !showDiscardPile &&
        //       activeCard !== null &&
        //       activeCard.init &&
        //       state.ink >= activeCard.inkCost &&
        //       state.turn &&
        //       resolveBtnRef.current
        //     ) {
        //         resolveBtnRef.current.click();
        //     } else if (!state.turn && endTurnBtnRef.current) {
        //       endTurnBtnRef.current.click();
        //     } else {
        //         console.log(endTurnBtnRef)
        //     }
        // } else if (event.code === "Escape") {
        //     if (
        //       !state.turn ||
        //       (showDiscardPile && activeCard !== null) ||
        //       glowItems
        //     ) {
        //       setActiveCard(null);
        //     } else if (showDiscardPile && overlayRef.current) {
        //         overlayRef.current().click();
        //     }
        // }
    }

    useEffect(() => {
        const handleKeyup = (event) => {
          handleKey(event);
        };

        window.addEventListener("keyup", handleKeyup);

        if (!gameReady && !dev) {
            if (players < 1) navigate("/");

            setDraws(getDraws());

            dispatch({
                type: "SET_DECK",
                payload: shuffleDeck(deckJson)
            });

            if (state.playArea.length === 0) setGame();
        }

        return () => {
          window.removeEventListener("keydown", handleKeyup);
        };
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
            return () => clearTimeout(timer);
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

    useEffect(() => {
        dispatch({
            type: "SET_LIVE_STATE",
            payload: turn
        });
    }, [turn]);

    useEffect(() => {
        let audio = null; 
        if (winner === "Ursula") {
            audio = new Audio(gameOverSound);
        } else if (winner === "Players") {
          audio = new Audio(winnerSound);
        }

        audio && audio.play();
    }, [winner])

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
                            ref={endTurnBtnRef}
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
                                    onClick={() => clickCard(card)}
                                    showPrp={true}
                                    className={`game-card ${isPlaying && !card.ready ? "card-animated" : ""
                                        } 
                                        ${banishedCard &&
                                            card.id === banishedCard.id
                                            ? "banished-card"
                                            : ""
                                        }
                                        ${card.exerted &&
                                            (!banishedCard ||
                                                card.id !== banishedCard.id)
                                            ? "exerted"
                                            : ""
                                        }
                                        ${!card.ready &&
                                            card.type !== "item" &&
                                            !card.exerted
                                            ? "grayscale-image"
                                            : ""
                                        }
                                        ${glowItems && card.type === "item"
                                            ? "glowing-card"
                                            : "shadowing-card"
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
                    ref={overlayRef}
                    className="overlay"
                    onClick={() =>
                        (!turn || showDiscardPile || glowItems) && setActiveCard(null)
                    }
                >
                    <Card
                        properties={activeCard}
                        className={`preview-card ${turn || showDiscardPile ? "animated-preview" : ""
                            }`}
                        showPrp={true}
                    />
                    {!showDiscardPile &&
                        activeCard.init &&
                        state.ink >= activeCard.inkCost &&
                        turn && (
                            <Button
                                ref={resolveBtnRef}
                                className={"resolve-button"}
                                onClick={() => resolveActiveCard(activeCard)}
                            >
                                <span>{activeCard.cardNumber === 21 ? "SELECCIONAR" : "RESOLVER"}</span>
                            </Button>
                        )}
                    {makeDamage && (
                        <DamageCounter
                            damage={damageAmount}
                            onDamageClick={(e) => handleDamageAmount(e)}
                        />
                    )}
                    {(!turn || glowItems) && !showDiscardPile && (
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
                                        <span>
                                            {confirmExert ? "CONFIRMAR AGOTAR" : "AGOTAR"}
                                        </span>
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
