import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.sass']
})
export class MessageComponent implements OnInit {
  public message: string = "";
  private subscription: Subscription;

  constructor() {
    
    this.subscription = MessageService.messageSubject.subscribe(l => {
      this.message = l;
    })
    MessageService.messageSubject.next("Welcome! X plays first!")
  }

  ngOnInit(): void {
  }

}
