import { Navigate } from 'react-router-dom'

import GameList from '../Pages/GameList'
import GameScreen from '../Pages/GameScreen'

const router = [
  {
    path: '/',
    element: <Navigate to={'/home'} />,
  },
  {
    path: '/home',
    element: <GameList />,
  },
  {
    path: '/game/:id?',
    element: <GameScreen />,
  },
]

export default router
