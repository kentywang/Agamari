export function startGame(): {
    type: string;
};
export function stopGame(): {
    type: string;
};
export function startChat(): {
    type: string;
};
export function stopChat(): {
    type: string;
};
export function setNickname(text: any): {
    type: string;
    text: any;
};
export function setWorld(text: any): {
    type: string;
    text: any;
};
export function setError(error: any): {
    type: string;
    error: any;
};
export function resetError(): {
    type: string;
};
export function hideInstructions(): {
    type: string;
};
export function lose(eater: any): {
    type: string;
    eater: any;
};
export function keepPlaying(): {
    type: string;
};
export function fell(world: any): {
    type: string;
    world: any;
};
export function ateSomeone(eaten: any): {
    type: string;
    eaten: any;
};
export function startAsGuest(nickname: any, socket: any): (dispatch: any) => void;
export function focusOnChat(node: any): (dispatch: any) => void;
export function unfocusChat(node: any): (dispatch: any) => void;
declare function _default(state: {
    isPlaying: boolean;
    isChatting: boolean;
    nickname: string;
    world: string;
    status: string;
    error: any;
}, action: any): {
    isPlaying: boolean;
    isChatting: boolean;
    nickname: string;
    world: string;
    status: string;
    error: any;
};
export default _default;
