import { User } from '../../UserProvider/Types'
import { IColor } from 'react-color-palette'
import {Game} from "../../../Pages/GameList/Types";

export interface ICreateGame {
  show: boolean
  onClose: (createdGame?: Game) => void
}

export interface ICreateGameForm {
  name: string
  user: User | null
  participant: User | null
  backgroundColor: IColor
}

export interface ICreateGameResponse{
  createBoard: Game
}
