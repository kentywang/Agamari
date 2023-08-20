export function openConsole(): {
    type: string;
};
export function closeConsole(): {
    type: string;
};
export function openBugReport(): {
    type: string;
};
export function closeBugReport(): {
    type: string;
};
export function setNickname(text: any): {
    type: string;
    text: any;
};
export function resetNickname(): {
    type: string;
};
export function setError(error: any): {
    type: string;
    error: any;
};
export function resetError(): {
    type: string;
};
export function startAsGuest(nickname: any, socket: any): (dispatch: any) => void;
declare function _default(state: {
    isOpen: boolean;
    bugReportOpen: boolean;
    nickname: string;
    error: any;
}, action: any): {
    isOpen: boolean;
    bugReportOpen: boolean;
    nickname: string;
    error: any;
};
export default _default;
