import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Move } from './move.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  static messageSubject: Subject<string> = new Subject();
  static historySubject: Subject<Move[]> = new Subject();
  constructor() {
    
  }
}
