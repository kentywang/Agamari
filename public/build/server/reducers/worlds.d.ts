export function reducer(state: any[], action: any): any[];
export function addWorld(world: any): {
    type: string;
    world: any;
};
export function removeWorld(id: any): {
    type: string;
    id: any;
};
export function destroyWorld(id: any): (dispatch: any) => void;
