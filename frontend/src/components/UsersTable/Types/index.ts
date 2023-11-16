import { User } from '../../UserProvider/Types'

export interface IUsersResponse {
  users: User[]
}

export enum USER_TABLE_MOD {
  VIEW = 'view',
  SELECT = 'select',
}
