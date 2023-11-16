export interface User {
  id: string
  name: string
  uid: string
}
export interface IUserContext {
  user: User | null
  setUser?: (user: User) => void
}

export interface IUserForm {
  name: string
}

export interface IUserCreateResponse {
  createUser: User
}

export interface IUserFindResponse {
  userByUid: User | null
}
