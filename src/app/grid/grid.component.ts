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
  @Output() active: EventEmitter<boolean> = new EventEmitter<boolean>();
  active2: boolean = true;
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
      if (a === this.index || a === -1) {
        // this.active.emit(true)
        this.active2 = true;
      } else {
        // this.active.emit(false)
        this.active2 = false;
      }      
    })
  }

  ngOnInit(): void {
  }

}
