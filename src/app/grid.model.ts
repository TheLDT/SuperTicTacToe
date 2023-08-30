export class Grid {
    cells: string[] = [];
    cellsUsed: number = 0;
    winner: string = "";
    ended: boolean = false;

    setWinner(symbol: string) {
        this.winner = symbol
        this.ended = symbol != ""
    }
}