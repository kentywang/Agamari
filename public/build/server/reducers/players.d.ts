export function reducer(state: {}, action: any): any;
export function receivePlayers(players: any): {
    type: string;
    players: any;
};
export function receivePlayer(id: any, data: any): {
    type: string;
    id: any;
    data: any;
};
export function assignWorld(id: any, world: any): {
    type: string;
    id: any;
    world: any;
};
export function updatePlayer(id: any, data: any): {
    type: string;
    id: any;
    data: any;
};
export function changePlayerScale(id: any, change: any): {
    type: string;
    id: any;
    change: any;
};
export function removePlayer(id: any): {
    type: string;
    id: any;
};
export function updateVolume(id: any, volume: any): {
    type: string;
    id: any;
    volume: any;
};
export function incrementFoodEaten(id: any): {
    type: string;
    id: any;
};
export function clearFoodEaten(id: any): {
    type: string;
    id: any;
};
export function incrementPlayersEaten(id: any): {
    type: string;
    id: any;
};
export function clearPlayersEaten(id: any): {
    type: string;
    id: any;
};
export function addFoodToDiet(food: any, id: any, data: any): {
    type: string;
    food: any;
    id: any;
    data: any;
};
export function addPlayerToDiet(food: any, id: any, data: any): {
    type: string;
    food: any;
    id: any;
    data: any;
};
export function clearDiet(id: any): {
    type: string;
    id: any;
};
export function addPlayer(id: any, player: any): (dispatch: any) => void;
export function playerEatsPlayer(eater: any, eaten: any, volume: any): (dispatch: any) => void;
export function playerLeaves(player: any): (dispatch: any) => void;
export function eatFood(player: any, foodId: any, numberPeople: any, place: any, volume: any): (dispatch: any) => void;
