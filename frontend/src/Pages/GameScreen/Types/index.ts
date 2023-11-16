import { Game } from '../../GameList/Types'

export interface IGameScreen {
  selectedGame: Game
  open: boolean
  close: (open: boolean) => void
}

export interface IGameResponse {
  board: Game
}

export interface ISetDocIdResponse {
  setFirestoreDocId:Game
}

export interface ISetAddWinnerResponse {
  addWinner:Game
}