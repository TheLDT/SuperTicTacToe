import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Grid } from './grid.model';
import { MessageService } from './message.service';
import { HistoryService } from './history.service';
import { Move } from './move.model';
import { TurnService } from './turn.service';
import { ActiveGrid } from './activeGrid.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public static gridEnd: Subject<string> = new Subject();
  public static activeGrid: Subject<ActiveGrid> = new Subject();
  public static undo: Subject<Move> = new Subject();

  private grids: Grid[] = new Array();
  private bigGrid: Grid = new Grid;
  private nextGrid: number = -1;

  constructor(private historyService: HistoryService, private turnService: TurnService) {
    for (let i = 0; i < 9; i++) {
      this.grids[i] = new Grid;
      this.bigGrid.cells[i] = "";
    }
  }

  public hasGridEnded(gridIndex: number) {
    return this.grids[gridIndex].ended;
  }

  public getNextGrid() {
    return this.nextGrid;
  }

  public setNextGridHover(val: ActiveGrid) {    
    if (this.bigGrid.cells[val.index] != "" && !val.outOfBounds) {
       val.all = true;
    }
    GameService.activeGrid.next(val);
  }

  public updateGrid(gridIndex: number, index: number, symbol: string) {
    this.grids[gridIndex].cells[index] = symbol;
    let activeGrid = new ActiveGrid();
    if (symbol != "") {
      this.checkGrid(gridIndex, symbol);
      //change the active grid
      activeGrid.index = index;
      this.nextGrid = index;
      //if the active grid is full or won, play anywhere
      if (this.bigGrid.cells[index] != "" && this.bigGrid.cells[index] != "U") {
        activeGrid.all = true;
        this.nextGrid = -1;
      }

      GameService.activeGrid.next(activeGrid);
      //update history      
      this.historyService.addMove(new Move(gridIndex, index, symbol));
    } else {//symbol == "" means undo 
      this.grids[gridIndex].cellsUsed--;
      this.grids[gridIndex].setWinner("")
      this.bigGrid.cells[gridIndex] = "";

      let newMove = this.historyService.getLastMove()
      GameService.undo.next(new Move(gridIndex, index, ""));
      if (newMove)
        activeGrid.index = newMove.index
      else
        activeGrid.all = true
      GameService.activeGrid.next(activeGrid);
      this.nextGrid = newMove ? newMove.index : -1;
    }
  }

  public undoMove() {
    let move = this.historyService.getLastMove();
    if (move) {
      this.historyService.undoMove();
      this.updateGrid(move.gridIndex, move.index, "")
      this.turnService.changeTurn()
    }
  }

  private checkGrid(gridIndex: number, symbol: string) {

    let grid = gridIndex === -1 ? this.bigGrid : this.grids[gridIndex];

    if (this.threeEqual(grid, 0, 1, 2)) {
      this.endGrid(gridIndex, symbol, "012");
    } else if (this.threeEqual(grid, 3, 4, 5)) {
      this.endGrid(gridIndex, symbol, "345");
    } else if (this.threeEqual(grid, 6, 7, 8)) {
      this.endGrid(gridIndex, symbol, "678");
    } else if (this.threeEqual(grid, 0, 3, 6)) {
      this.endGrid(gridIndex, symbol, "036");
    } else if (this.threeEqual(grid, 1, 4, 7)) {
      this.endGrid(gridIndex, symbol, "147");
    } else if (this.threeEqual(grid, 2, 5, 8)) {
      this.endGrid(gridIndex, symbol, "258");
    } else if (this.threeEqual(grid, 0, 4, 8)) {
      this.endGrid(gridIndex, symbol, "048");
    } else if (this.threeEqual(grid, 2, 4, 6)) {
      this.endGrid(gridIndex, symbol, "246");
    }

    grid.cellsUsed++;

    if (grid.cellsUsed === 9 && grid.winner === "") {
      grid.setWinner("Z")
      this.bigGrid.cells[gridIndex] = "Z";
      GameService.gridEnd.next(gridIndex + grid.winner);
      this.checkUnwinnable(-1);// check if the big grid is unwinnable
    } else {
      this.checkUnwinnable(gridIndex);
    }
  }

  private endGrid(gridIndex: number, symbol: string, combination: string) {

    GameService.gridEnd.next(gridIndex + symbol + "-" + combination);

    if (gridIndex != -1) { //if not big grid
      this.grids[gridIndex].setWinner(symbol)
      this.bigGrid.cells[gridIndex] = symbol;
      this.checkGrid(-1, symbol);
    } else {//game over
      MessageService.messageSubject.next("Game Over!" + symbol + " won!");
    }
  }

  private threeEqual(grid: Grid, one: number, two: number, three: number) {
    if (grid.cells[one] === "") {
      return false;
    }
    if (grid.cells[one] === undefined) {
      return false;
    }
    return grid.cells[one] === grid.cells[two] && grid.cells[two] === grid.cells[three];
  }

  // private combinationsX: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]
  // private combinationsO: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]

  private checkUnwinnable(gridIndex: number) {
    //already checked at cell count == 9
    let grid = new Grid;
    if (gridIndex == -1) {
      grid = this.bigGrid;
    } else {
      if (this.bigGrid.cells[gridIndex] === "Z" || this.bigGrid.cells[gridIndex] === "U")
        return;
      grid = this.grids[gridIndex];
    }
    let combinationsXLocal: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]
    let combinationsOLocal: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]
    //get cells equal to Z (unwinnable)
    for (let i = 0; i < 9; i++) {
      let cell = grid.cells[i];
      if (cell === 'X') {
        combinationsOLocal = combinationsOLocal.filter(l => { return !l.includes(i + "") })
      } else if (cell === 'O') {
        combinationsXLocal = combinationsXLocal.filter(l => { return !l.includes(i + "") })
      } else if (cell === 'Z' || cell === 'U') {
        combinationsXLocal = combinationsXLocal.filter(l => { return !l.includes(i + "") })
        combinationsOLocal = combinationsOLocal.filter(l => { return !l.includes(i + "") })
      }

      if (combinationsXLocal.length == 0 && combinationsOLocal.length == 0) {
        //this cell cannot be won, but still should be played
        this.bigGrid.cells[gridIndex] = "U";
        this.checkUnwinnable(-1);
      }
    }
    // console.log(gridIndex, this.bigGrid.cells[gridIndex]);
    // console.log(combinationsXLocal);
    // console.log(combinationsOLocal);
    // if valid table length is 0 then end game
    if (combinationsXLocal.length === 0 && combinationsXLocal.length === 0 && gridIndex === -1) {
      MessageService.messageSubject.next("Game over! No more possible combinations!");
    }
  }

  private threeNot(grid: any[], notSymbol: string, one: number, two: number, three: number) {
    if (grid[one] === notSymbol) {
      return true;
    }
    if (grid[two] === notSymbol) {
      return true;
    }
    if (grid[three] === notSymbol) {
      return true;
    }

    return false
  }
}
