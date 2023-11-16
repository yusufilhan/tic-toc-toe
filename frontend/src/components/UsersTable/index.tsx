import { gql, useQuery } from '@apollo/client'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import React, { useContext } from 'react'
import { IUsersResponse, USER_TABLE_MOD } from './Types'
import { User } from '../UserProvider/Types'
import { UserContext } from '../UserProvider'

const QUERY_ALL_USERS = gql`
  query GetAllUser {
    users {
      id
      name
      uid
    }
  }
`

const UsersTable = ({
  mode = USER_TABLE_MOD.VIEW,
  onSelect,
}: {
  mode: USER_TABLE_MOD
  onSelect?: (user: User) => void
}) => {
  const { user } = useContext(UserContext)

  const { data: users, loading } = useQuery<IUsersResponse>(QUERY_ALL_USERS)

  const onInviteButtonClicked = (user: User) => {
    if (onSelect) onSelect(user)
  }

  return (
    <TableContainer sx={{ py: 2 }}>
      <Table sx={{ minWidth: 250 }}>
        <TableHead>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading &&
            users?.users.map((item) => {
              if (item.id !== user?.id) {
                return (
                  <TableRow
                    key={item.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {item.name}
                    </TableCell>
                    {mode === USER_TABLE_MOD.SELECT && (
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          variant={'text'}
                          onClick={() => onInviteButtonClicked(item)}
                        >
                          Invite
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              }
            })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default UsersTable
