import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from '../game.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.sass']
})
export class GridComponent implements OnInit {
  public value: string;
  @Input() index: number;
  public gridWinner: string;
  active: boolean = true;
  hoverNext: boolean = false;
  private subWinner: Subscription;
  private subActive: Subscription;

  constructor() {
    this.value = "";
    this.index = -1;
    this.gridWinner = "";

    this.subWinner = GameService.gameSubject.subscribe(l => {
      if (+l.substring(0, 1) == this.index) {
        this.gridWinner = l.substring(1);
      }
    })

    this.subActive = GameService.gameSubjectActive.subscribe(a => {
      console.log(a);

      if (a === this.index || a === -1) {
        this.active = true;
      } else if (a - 100 === this.index || a - 100 === -1) {
        this.hoverNext = true;
      } else {
        if (a >= 99) {
          this.hoverNext = false;
        } else {
          this.active = false;
        }
      }
    })
  }

  ngOnInit(): void {
  }

}
