import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  static messageSubject: Subject<string> = new Subject();
  constructor() { }
}
