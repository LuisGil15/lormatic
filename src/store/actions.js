export const tridentItem = ({ handleLoreChange }, init, cardInfo) => {
    handleLoreChange(1);
};

export const confusedPresence = ({ playersData, setPlayersData }, init) => {
    if (init) {
        console.log("Si entra aqui");
        let playerDataTmp = [...playersData];

        playerDataTmp.map((player) => {
            if (player.lore >= 2) {
                player.lore -= 2;
            } else {
                player.lore = 0;
            }
        });

        console.log(playerDataTmp);
        setPlayersData([...playerDataTmp]);
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
            return { ...player, lore: player.lore - 3 };
        } 
        
        return { ...player, lore: 0 };
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

export const hexwellCrown = ({drawCard}) => {
    drawCard(1);
};

export const ursulasContract = ({ handleLoreChange }) => {
    handleLoreChange(3);
};

export const cardActionsMap = {
    12: confusedPresence,
    17: capsize,
    20: entanglingMagic,
    23: lightningStorm,
    25: tentacleSwipe,
    29: hexwellCrown,
    30: ursulasContract,
    31: tridentItem
};