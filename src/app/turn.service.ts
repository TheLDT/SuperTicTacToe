import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class TurnService {
  private turn: string;
  constructor() {
    this.turn = "X";
    MessageService.messageSubject.next("It's " + this.turn + " turn!");
  }

  getTurn() {
    return this.turn;
  }

  changeTurn() {
    this.turn = this.turn === "X" ? "O" : "X";
    MessageService.messageSubject.next("It's " + this.turn + " turn!");
  }

  getAndChangeTurn() {
    let toReturn: string = this.getTurn();
    this.changeTurn();
    return toReturn;
  }
}
