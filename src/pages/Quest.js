import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import CarruselCounter from "../components/molecules/CarruselCounter";
import PlayerCounter from "../components/molecules/PlayerCounter";

import deckJson from "../data/deck.json";

import { cardActionsMap } from "../store/actions";

import '../assets/styles/pages/Quest.css'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const Quest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { players, difficulty } = location.state || {};
    const [lore, setLore] = useState(0);
    const [discardPile, setDiscardPile] = useState([]);
    const [deck, setDeck] = useState([]);
    const [hand, setHand] = useState([]);
    const [playArea, setPlayArea] = useState([]);
    const [shouldDrawCards, setShouldDrawCards] = useState(false);
    const [draws, setDraws] = useState(0);
    const [ink, setInk] = useState(0);
    const [playersData, setPlayersData] = useState([]);

    const handleLoreChange = (delta) => {
        setLore((prev) => {
            const newCount = prev + delta;
            return newCount >= 0 && newCount <= 40 ? newCount : prev;
        });
    }

    const handleInk = (delta) => {
        setInk((prev) => {
            const newCount = prev + delta;
            return newCount > 0 ? newCount : 0;
        });
    }

    const drawCard = () => {
        if (deck.length > 0) {
            const topCard = deck[0];
            deck.shift();
            setHand((prev) => [...prev, topCard]);
        }
    }

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
    }

    const searchCard = (id) => {
        const cardInfo = deckJson.find(c => c.id === id);

        return cardInfo;
    }

    const setGame = () => {
        const playersArray = Array.from({ length: players }, (_, index) => ({
            id: index + 1,
            lore: 0
        }));

        setPlayersData(playersArray);
        setPlayArea((prev) => [...prev, searchCard(50)]);

        setDeck(deckJson.filter(carta => carta.id !== 50));
    }

    const getDraws = () => {
        const drawsConfig = {
            "1": { "Easy": 2, "Normal": 2, "Hard": 3, "Extreme": 3 },
            "2": { "Easy": 2, "Normal": 2, "Hard": 3, "Extreme": 3 },
            "3": { "Easy": 3, "Normal": 3, "Hard": 4, "Extreme": 4 },
            "4": { "Easy": 3, "Normal": 3, "Hard": 4, "Extreme": 4 }
        };

        const draws = drawsConfig[players]?.[difficulty] || 0;

        return draws;
    }

    const playCard = (cardInfo) => {
        const action = cardActionsMap[cardInfo.cardNumber];
        if (action) {
            action(
              {
                lore,
                handleLoreChange,
                ink,
                setInk,
                playersData,
                setPlayersData,
              },
              cardInfo
            );
        } else {
            console.log(
              `Card action not found ${cardInfo.name}`
            );
        }
    };

    const resolvePlayArea = () => {
        for(let i = 0; i < playArea.length; i++) {
            playCard(playArea[i]);
            updateCardExerted(playArea[i].id, true);
        }
    };

    const updateCardExerted = (cardId, exertedValue) => {
        const updatedPlayArea = playArea.map((card) => {

            if (card.id === cardId) {
                return {
                    ...card,
                    exerted: exertedValue
                };
            }

            return card;
        });

        setPlayArea(updatedPlayArea);
    }

    const resolveHand = async (tmpHand, tmpInk) => {

        if (tmpHand.length > 0) {
            const tmpCard = { ...tmpHand[tmpHand.length - 1], flipped: true };

            setHand([...tmpHand.slice(0, -1), tmpCard]);

            await sleep(1000)

            setHand(tmpHand.slice(0, -1));

            if (tmpInk >= tmpCard.inkCost) {
                if (tmpCard.type === "item" || tmpCard.type === "character") {
                    setPlayArea((prev) => [...prev, tmpCard]);
                } else {
                    setDiscardPile((prev) => [...prev, tmpCard]);
                }
            } else {
                tmpInk++;
                handleInk(1);
            }

            await sleep(1000);

            resolveHand(tmpHand.slice(0, -1), tmpInk);
        }
    }

    useEffect(() => {
        //If you enter direct to quest skiping game settings, redirect to home
        if (players < 1) navigate('/');

        //Set draw number depends on players and difficult
        setDraws(getDraws());

        //Shuffle cards and set on deck
        setDeck(shuffleDeck(deckJson));

        //Set game at the begin
        if (playArea.length === 0) setGame();

        resolvePlayArea();
        setShouldDrawCards(true);
    }, []);

    useEffect(() => {
        const drawCardsWithDelay = async () => {
            for (let i = 0; i < draws; i++) {
                drawCard();
                await sleep(500);
            }

            setShouldDrawCards(false);
        };

        if (shouldDrawCards) {
            drawCardsWithDelay();
        }
    }, [shouldDrawCards]);

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
        <div className="ink-container">
          <span className="lore-text">INKWELL</span>
          <div className="ink">
            <div className="ink-inner">
              <span>{ink}</span>
            </div>
          </div>
        </div>
        <div className="title">
          <span className="lore-text">URSULA</span>
        </div>
        <div className="lore-zone">
          <CarruselCounter lore={lore} />
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
            <div className="deck-zone" onClick={() => drawCard()}>
              {deck.length > 0 ? (
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
              {hand.length > 0 ? (
                hand.map((card) => {
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
          <div className="third-column"></div>
        </div>
        <div className="game-zone">
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
          <Button onClick={() => resolveHand(hand, ink)}>Resolve hand</Button>
          <Button onClick={() => resolvePlayArea()}>Resolve game zone</Button>
        </div>
      </div>
    );
};

export default Quest;
