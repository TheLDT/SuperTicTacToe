import { Component } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'SuperTicTacToe';

  active: boolean = true;
  public theme: string = "light";

  constructor(private gameService: GameService) {

  }

  public setActiveFromChild(activeChild: boolean) {
    this.active = activeChild;
  }

  public undo() {
    this.gameService.undoMove()
  }

  public toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';    
  }
}
