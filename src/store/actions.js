export const tridentItem = ({ lore, handleLoreChange }, cardInfo) => {
  handleLoreChange(1);
};

export const cardActionsMap = {
    31: tridentItem,
};