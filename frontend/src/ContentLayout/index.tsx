import { Box } from '@mui/material'
import { useRoutes } from 'react-router'
import routes from '../Routes'
import UserHeader from '../components/UserHeader'
import React from 'react'

const ContentLayout = () => {
  const page = useRoutes(routes)

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <Box component={'header'}>
        <UserHeader />
      </Box>
      <Box
        component={'main'}
        sx={{
          p: 3,
          mt: '48px',
          height: 'calc(100vh - 48px)',
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        {page}
      </Box>
    </Box>
  )
}

export default ContentLayout
