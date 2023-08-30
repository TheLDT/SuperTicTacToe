import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Move } from './move.model';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: Move[] = []
  public static lastMove: Subject<Move> = new Subject();

  constructor() { }

  addMove(move: Move) {
    this.history.push(move);
    MessageService.historySubject.next(this.history);
  }

  getLastMove() {
    return this.history.at(-1);
  }

  undoMove() {
    this.history.pop();
    MessageService.historySubject.next(this.history);
  }

}
