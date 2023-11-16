import { AppBar, Box, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from '../UserProvider'
import {useNavigate} from "react-router";

const UserHeader = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        sx={{
          width: 'calc(100% - 48px)',
          left: '24px',
          p: 2,
          flexDirection: 'row',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: 'flex', cursor: 'pointer' }}
          onClick={()=> {
            navigate('/')
          }}
        >
          Tic Toc Toe
        </Typography>
        <Typography
          variant={'body1'}
          component="div"
          sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}
        >
          {user?.name}
        </Typography>
      </AppBar>
    </Box>
  )
}

export default UserHeader
