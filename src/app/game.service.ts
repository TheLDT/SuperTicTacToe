import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Grid } from './grid.model';
import { MessageService } from './message.service';
import { HistoryService } from './history.service';
import { Move } from './move.model';
import { TurnService } from './turn.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public static gridEnd: Subject<string> = new Subject();
  public static gameSubjectActive: Subject<number> = new Subject();
  public static undo: Subject<Move> = new Subject();

  private grids: Grid[] = new Array();
  private bigGrid: Grid = new Grid;
  private nextGrid: number = -1;
  private nextGridHover: number = -1;

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

  public setNextGridHover(val: number) {
    if (val === 1000) {// out of bounds
      this.nextGridHover = val;
    } else if (this.bigGrid.cells[val - 100] != "") {
      this.nextGridHover = 99;
    } else {
      this.nextGridHover = val;
    }

    GameService.gameSubjectActive.next(this.nextGridHover);
  }

  public getNextGridHover() {
    return this.nextGridHover;
  }

  public updateGrid(gridIndex: number, index: number, symbol: string) {
    this.grids[gridIndex].cells[index] = symbol;
    if (symbol != "") {
      this.checkGrid(gridIndex, symbol);
      //change the active grid
      this.nextGrid = index;
      //if the active grid is full or won, play anywhere
      if (this.bigGrid.cells[index] != "") {
        this.nextGrid = -1;
      }
      GameService.gameSubjectActive.next(this.nextGrid);
      //update history
      console.log(gridIndex, index, symbol);
      
      this.historyService.addMove(new Move(gridIndex, index, symbol));
    } else {//symbol == "" means undo 
      this.grids[gridIndex].cellsUsed--;
      this.grids[gridIndex].setWinner("")
      this.bigGrid.cells[gridIndex] = "";

      let newMove = this.historyService.getLastMove()
      GameService.undo.next(new Move(gridIndex, index, ""));
      GameService.gameSubjectActive.next(newMove ? newMove.index : -1);
      this.nextGrid = newMove ? newMove.index : -1;
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
      this.checkUnwinnable();
    }

    //check unwinnable
    if (gridIndex === -1) {
      this.checkUnwinnable();
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

  private combinationsX: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]
  private combinationsO: string[] = ["012", "345", "678", "036", "147", "258", "048", "246"]

  private checkUnwinnable() {
    //get cells equal to Z (unwinnable)
    for (let i = 0; i < 9; i++) {
      let cell = this.bigGrid.cells[i];
      if (cell === "Z") {//check winnable for either
        //remove all potential combinations from valid table
        this.combinationsX = this.combinationsX.filter(l => { return !l.includes(i + "") })
        this.combinationsO = this.combinationsO.filter(l => { return !l.includes(i + "") })
      } else if (cell === "X") {//remove winnables from O
        //for each combination, check if the cells are not occupied by other player
        for (let combo of this.combinationsO) {
          let split: string[] = combo.split('');
          if (this.threeNot(this.bigGrid.cells, "X", +split[0], +split[1], +split[2])) {
            this.combinationsO = this.combinationsO.filter(l => { return l !== combo })
          }
        }
      } else if (cell === "O") {//remove winnables from X
        //for each combination, check if the cells are not occupied by other player
        for (let combo of this.combinationsX) {
          let split: string[] = combo.split('');
          if (this.threeNot(this.bigGrid.cells, "O", +split[0], +split[1], +split[2])) {
            this.combinationsX = this.combinationsX.filter(l => { return l !== combo })
          }
        }
      }
    }
    // if valid table length is 0 then end game
    if (this.combinationsX.length === 0 && this.combinationsO.length === 0) {
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

  public undoMove() {
    let move = this.historyService.getLastMove();
    if (move) {
      this.historyService.undoMove();
      this.updateGrid(move.gridIndex, move.index, "")
      this.turnService.changeTurn()
    }
  }
}
