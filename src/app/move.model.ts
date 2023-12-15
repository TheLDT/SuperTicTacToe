export class Move {
    gridIndex: number = -1;
    index: number = -1;
    symbol: string = "";
    winningCombination: string = "";
    
    constructor(g: number, i: number, s: string) {
        this.gridIndex = g;
        this.index = i;
        this.symbol = s;
    }

    public toString() {
        return this.gridIndex + "" + this.index + "" + this.symbol
    }
}