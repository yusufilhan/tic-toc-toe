import { User } from '../../../components/UserProvider/Types'

export enum GAME_STATUS {
  NOT_STARTED = 'Not Started',
  STARTED = 'Started',
  FINISHED = 'Finished',
}

export interface Game {
  firestoreDocId?: string
  id: string
  name: string
  user: User
  participant: User
  winner: User | null
  turn: User | null
  status?: GAME_STATUS
  createdAt?: Date
  backgroundColor: string
}

export interface IGamesResponse {
  boards: Game[]
}
