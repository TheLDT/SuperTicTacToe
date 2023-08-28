import { Component, Input, OnInit } from '@angular/core';
import { TurnService } from '../turn.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.sass']
})
export class CellComponent implements OnInit {

  public value: string;

  @Input() index: number;
  @Input() gridIndex: number;
  constructor(private turnService: TurnService, private gameService: GameService) {
    this.value = "";
    this.index = -1;
    this.gridIndex = -1;
  }

  ngOnInit(): void {
  }

  setValue() {
    if (this.value === "" && this.gameService.notFullOrWon(this.gridIndex)
      && (this.gameService.getNextGrid() == this.gridIndex || this.gameService.getNextGrid() == -1)) {
      this.value = this.turnService.getAndChangeTurn();
      this.gameService.updateGrid(this.gridIndex, this.index, this.value);
    }
  }

}
