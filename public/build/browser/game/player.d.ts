export class Player {
    constructor(id: any, data: any, isMainPlayer: any);
    id: any;
    initialData: any;
    isMainPlayer: any;
    init(): void;
    mesh: any;
    get meshData(): {
        x: any;
        y: any;
        z: any;
        qx: any;
        qy: any;
        qz: any;
        qw: any;
    };
}
export let controls: any;
