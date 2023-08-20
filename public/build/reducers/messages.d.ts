export function receiveMessages(messages: any): {
    type: string;
    messages: any;
};
export function receiveMessage(message: any): {
    type: string;
    message: any;
};
export function removeMessage(idx: any): {
    type: string;
    idx: any;
};
export function removeAllMessages(): {
    type: string;
};
declare function _default(state: any[], action: any): any;
export default _default;
