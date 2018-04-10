import Game from './Game';

export default class SpeedGame extends Game {
   constructor(lineCount) {
      super();
      this.name = 'speed';
      this.lineCount = lineCount;
   }
}