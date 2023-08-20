export function authenticated(user: any): {
    type: string;
    user: any;
};
export function logout(): {
    type: string;
};
export function loginGuest(socket: any, nickname: any): (dispatch: any) => void;
declare function _default(state: any, action: any): any;
export default _default;
