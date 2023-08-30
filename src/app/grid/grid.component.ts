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
  active: boolean = true;
  hoverNext: boolean = false;
  public lastGridPlayed:boolean = false;
  private subWinner: Subscription;
  private subActive: Subscription;
  private subUndo: Subscription;
  private subLastGrid: Subscription;
  constructor() {
    this.value = "";
    this.indexGrid = -1;
    this.gridWinner = "";

    this.subWinner = GameService.gridEnd.subscribe(l => {
      if (+l.substring(0, 1) == this.indexGrid) {
        this.gridWinner = l.substring(1, 2);
      }
    })

    this.subActive = GameService.gameSubjectActive.subscribe(a => {
      if (a === this.indexGrid || a === -1) {
        this.active = true;
      } else if (a - 100 === this.indexGrid || a - 100 === -1) {
        this.hoverNext = true;
      } else {
        if (a >= 99) {
          this.hoverNext = false;
        } else {
          this.active = false;
        }
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
      } else {
        this.lastGridPlayed = false;
      }
    })
  }

  ngOnInit(): void {
  }

}
