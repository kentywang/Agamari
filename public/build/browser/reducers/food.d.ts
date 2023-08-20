export function receiveFood(id: any, data: any): {
    type: string;
    id: any;
    data: any;
};
export function receiveMultipleFood(food: any): {
    type: string;
    food: any;
};
export function removeFood(id: any): {
    type: string;
    id: any;
};
export function removeAllFood(): {
    type: string;
};
declare function _default(state: {}, action: any): any;
export default _default;
