import { Backdrop, CircularProgress } from '@mui/material'
import React from 'react'

const Loader = ({ loading }: { loading: boolean }) => {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={loading}>
      <CircularProgress color="inherit" size={60} />
    </Backdrop>
  )
}
export default Loader
