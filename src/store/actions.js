export const tridentItem = ({ handleLoreChange }, init) => {
    handleLoreChange(1);
};

export const confusedPresence = ({ playersData, setPlayersData }, init) => {
    if (init) {
        let playerDataTmp = [...playersData];

        playerDataTmp.map((player) => {
            if (player.lore >= 2) {
                player.lore -= 2;
            } else {
                player.lore = 0;
            }
        });

        setPlayersData(playerDataTmp);
    }
};

export const capsize = (
    {
        ink,
        deck,
        dispatch,
        handleInk
    }
) => {
    if (ink <= 6) {
        dispatch({
            type: "SET_DECK",
            payload: [...deck.slice(0, -3)],
        });

        handleInk();

        dispatch({
            type: "SET_INK",
            payload: ink + 3,
        });
    }
};

export const entanglingMagic = ({ ink, dispatch, handleInk }) => {
    handleInk();

    dispatch({
      type: "SET_INK",
      payload: ink + 1,
    });
};

export const lightningStorm = ({ playersData, setPlayersData }) => {
    let playerDataTmp = [...playersData];

    playerDataTmp.map((player) => {
        if (player.lore >= 3) {
            player.lore -= 3;
        } else {
            player.lore = 0;
        }
    });

    setPlayersData(playerDataTmp);
};

export const tentacleSwipe = ({ink, dispatch, handleInk}) => {
    handleInk();

    dispatch({
        type: "SET_INK",
        payload: ink + 1
    });
};

export const cardActionsMap = {
    12: confusedPresence,
    17: capsize,
    20: entanglingMagic,
    23: lightningStorm,
    25: tentacleSwipe,
    31: tridentItem
};