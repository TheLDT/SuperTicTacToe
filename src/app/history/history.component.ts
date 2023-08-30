import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Move } from '../move.model';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass']
})
export class HistoryComponent implements OnInit {
  public history: Move[] = []

  constructor() {
    MessageService.historySubject.subscribe(h => {
      this.history = h;
    })
  }

  ngOnInit(): void {

  }

  mouseEnter(index: number) {
    HistoryService.lastMove.next(this.history[index])
  }

  mouseLeave(index: number) {
    HistoryService.lastMove.next(new Move(-1, -1, ""))
  }

}
