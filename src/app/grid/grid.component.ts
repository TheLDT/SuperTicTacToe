import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../game.service';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.sass']
})
export class GridComponent implements OnInit {
  public value: string;
  @Input() indexGrid: number;
  public gridWinner: string;
  gridGameWinner: boolean = false;
  active: boolean = true;
  hoverNext: boolean = false;
  hovered: boolean = true;
  public lastGridPlayed: boolean = false;
  private subWinner: Subscription;
  private subActive: Subscription;
  private subUndo: Subscription;
  private subLastGrid: Subscription;

  constructor() {
    this.value = "";
    this.indexGrid = -1;
    this.gridWinner = "";

    this.subWinner = GameService.gridEnd.subscribe(l => {
      if (l.gridIndex === this.indexGrid) {
        this.gridWinner = l.symbol
      }

      if (l.gridIndex === -1 && l.winningCombination.includes(this.indexGrid + "")) {
        this.gridGameWinner = true;
      }
    })

    this.subActive = GameService.activeGrid.subscribe(a => {
      if (a.index === this.indexGrid || a.all) {
        if (a.hover) {
          this.hoverNext = true;
        } else {
          this.active = true;
        }
      } else if (a.hover || a.outOfBounds) {
        this.hoverNext = false;
      } else {
        this.active = false;
      }
    })

    this.subUndo = GameService.undo.subscribe(l => {
      if (l.gridIndex == this.indexGrid) {
        this.gridWinner = ""
      }
    })

    this.subLastGrid = HistoryService.lastMove.subscribe(l => {
      if (l.gridIndex == this.indexGrid) {
        this.lastGridPlayed = true;
        this.hovered = true;
      } else {
        this.lastGridPlayed = false;
        this.hovered = false;
      }
    })
  }

  ngOnInit(): void {
  }

  mouseEnter() {
    console.log("enter");
    
    this.hovered = true;
  }

  mouseLeave() {
    console.log("leave");
    // if (this.gridWinner != '')
      this.hovered = false;
  }
}
