import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Grid } from './grid.model';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private grids: Grid[] = new Array();
  private bigGrid: Grid = new Grid;
  static gameSubject: Subject<string> = new Subject();
  static gameSubjectActive: Subject<number> = new Subject();
  private nextGrid: number = -1;
  private nextGridHover: number = -1;
  constructor() {

    for (let i = 0; i < 9; i++) {
      this.grids[i] = new Grid;
    }
  }

  public notFullOrWon(gridIndex: number) {
    return this.grids[gridIndex].notFullOrWon;
  }

  public getNextGrid() {
    return this.nextGrid;
  }

  public setNextGridHover(val: number) {
    if(this.bigGrid.cells[val-100] != undefined){
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

    this.checkGrid(gridIndex, symbol);

    //change the active grid
    this.nextGrid = index;
    //if the active grid is full or won, play anywhere
    if (this.bigGrid.cells[index] != undefined) {
      this.nextGrid = -1;
    }
    GameService.gameSubjectActive.next(this.nextGrid);
  }

  private checkGrid(gridIndex: number, symbol: string) {

    let grid = gridIndex === -1 ? this.bigGrid : this.grids[gridIndex];

    if (this.threeEqual(grid, 0, 1, 2)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 3, 4, 5)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 6, 7, 8)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 0, 3, 6)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 1, 4, 7)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 2, 5, 8)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 0, 4, 8)) {
      this.endGrid(gridIndex, symbol);
    } else if (this.threeEqual(grid, 2, 4, 6)) {
      this.endGrid(gridIndex, symbol);
    }

    grid.cellsUsed++;

    if (grid.cellsUsed === 9 && grid.winner === "") {
      grid.notFullOrWon = false;
      grid.winner = "Z";
      this.bigGrid.cells[gridIndex] = "Z";
      GameService.gameSubject.next(gridIndex + grid.winner);
      this.checkUnwinnable();
    }

    //check unwinnable
    if (gridIndex === -1) {
      this.checkUnwinnable();
    }
  }

  private endGrid(gridIndex: number, symbol: string) {

    GameService.gameSubject.next(gridIndex + symbol);

    if (gridIndex != -1) { //prevent infinite check of big grid
      this.grids[gridIndex].notFullOrWon = false;
      this.grids[gridIndex].winner = symbol;
      this.bigGrid.cells[gridIndex] = symbol
      this.checkGrid(-1, symbol);
    } else {//game over
      MessageService.messageSubject.next("Game Over!" + symbol + " won!");
    }
  }

  private threeEqual(grid: Grid, one: number, two: number, three: number) {
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
    console.log(this.combinationsX);
    console.log(this.combinationsO);
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

}
