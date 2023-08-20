export function reducer(state: {}, action: any): any;
export function receiveAllFood(food: any): {
    type: string;
    food: any;
};
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
export function removeMultipleFood(food: any): {
    type: string;
    food: any;
};
