export function launch(): {
    type: string;
};
export function launchReady(): {
    type: string;
};
export function buildUp(num: any): {
    type: string;
    meter: string;
};
declare function _default(state: {
    launch: boolean;
    meter: string;
}, action: any): {
    launch: boolean;
    meter: string;
};
export default _default;
