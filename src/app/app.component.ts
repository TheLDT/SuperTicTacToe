import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'SuperTicTacToe';


  active: boolean = true;

  constructor() {

  }

  public setActiveFromChild(activeChild: boolean) {
    this.active = activeChild;
  }
}
