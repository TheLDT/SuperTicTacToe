import { Component, Input, OnInit } from '@angular/core';
import { TurnService } from '../turn.service';
import { GameService } from '../game.service';
import { Subscription, of } from 'rxjs';
import { HistoryService } from '../history.service';
import { ActiveGrid } from '../activeGrid.model';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.sass']
})
export class CellComponent implements OnInit {

  public value: string;
  public current: string;
  @Input() index: number;
  @Input() gridIndex: number;
  private subWinner: Subscription;
  private subUndo: Subscription;
  private subLastCell: Subscription;
  public isWinner: boolean = false;
  public lastCellPlayed: boolean = false;

  constructor(private turnService: TurnService, private gameService: GameService) {
    this.value = "";
    this.index = -1;
    this.gridIndex = -1;

    this.current = "";

    this.subWinner = GameService.gridEnd.subscribe(l => {
      if (+l.substring(0, 1) == this.gridIndex) {
        let split = l.split("-")
        if (split.length > 1) {
          if (split[1].includes(this.index + "")) {
            this.isWinner = true;
          }
        }
      }
    })

    this.subUndo = GameService.undo.subscribe(u => {
      if (u.gridIndex == this.gridIndex) {
        this.isWinner = false
        if (u.index == this.index)
          this.value = ""
      }
    })

    this.subLastCell = HistoryService.lastMove.subscribe(l => {
      if (l.gridIndex == this.gridIndex && l.index == this.index) {
        this.lastCellPlayed = true;
      } else {
        this.lastCellPlayed = false;
      }
    })
  }

  ngOnInit(): void {
  }

  setValue() {
    if (this.gameService.hasGridEnded(this.gridIndex))
      return
    if (this.value != "")
      return
    if (this.gameService.getNextGrid() == this.gridIndex || this.gameService.getNextGrid() == -1) {
      this.value = this.turnService.getAndChangeTurn();

      this.gameService.updateGrid(this.gridIndex, this.index, this.value);
    }

    this.mouseLeave()
  }

  mouseEnter() {
    if (this.gameService.hasGridEnded(this.gridIndex))
      return

    if (this.gameService.getNextGrid() === this.gridIndex || this.gameService.getNextGrid() === -1) {
      this.current = this.turnService.getTurn();
      //next grid hover
      let activeGrid = new ActiveGrid();
      activeGrid.index = this.index;
      activeGrid.hover = true;
      this.gameService.setNextGridHover(activeGrid)
    }
  }

  mouseLeave() {
    this.current = "";
    let activeGrid = new ActiveGrid();
    activeGrid.outOfBounds = true;
    this.gameService.setNextGridHover(activeGrid)//out of bounds
  }

}
