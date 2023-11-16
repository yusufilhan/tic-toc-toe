import { gql, useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Game, GAME_STATUS, IGamesResponse } from './Types'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import CreateGame from '../../components/CreateGame'
import { db, firebaseApp } from '../../firebase-config'
import Loader from '../../components/Loader'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router'

const QUERY_ALL_GAMES = gql`
  query Boards {
    boards {
      id
      name
      user {
        id
        name
        uid
      }
      participant {
        id
        name
        uid
      }
      winner {
        id
        name
        uid
      }
      turn {
        id
        name
        uid
      }
      backgroundColor
    }
  }
`

const MUTATION_SET_TURN = gql`
  mutation SetTurn($boardId: ID!, $turn: UserInput!) {
    setTurn(boardId: $boardId, turn: $turn) {
      id
      name
      user {
        id
        name
        uid
      }
      participant {
        id
        name
        uid
      }
      backgroundColor
      turn {
        id
        name
        uid
      }
    }
  }
`

const GameList = () => {
  const navigate = useNavigate()
  const {
    data: gamesResponse,
    loading,
    client,
  } = useQuery<IGamesResponse>(QUERY_ALL_GAMES)

  const [setTurn] = useMutation<Game>(MUTATION_SET_TURN)

  const auth = getAuth(firebaseApp)

  const [openCreateGame, setOpenCreateGame] = useState<boolean>(false)

  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const [games, setGames] = useState<Game[]>([])

  const [loader, setLoader] = useState<boolean>(loading)

  const [activeGameId, setActiveGameId] = useState<string | undefined>(undefined)

  const gamesRef = collection(db, 'games')

  useEffect(() => {
    setLoader(loading)
  }, [loading])

  useEffect(() => {
    if(selectedGame){
      navigate('/game/' + selectedGame?.id)
    }
  }, [selectedGame]);

  useEffect(() => {
    if (gamesResponse?.boards) {
      setGames(gamesResponse.boards)
    }
  }, [gamesResponse])

  useEffect(() => {
    const queryGames = query(
        gamesRef,
        orderBy('createdAt')
    )

    let tempData: Game[] = []
    onSnapshot(queryGames, (snapshot) => {
      tempData = []
      snapshot.forEach((doc) => {
        tempData.push({ ...doc.data(), firestoreDocId: doc.id } as Game)
      })

      const tempGames = tempData.filter(
          (obj, index) =>
              // @ts-ignore
              tempData.findIndex((item) => item.id === obj.id) === index
      )

      setGames(tempGames)

      for (const game of tempGames){
        if(game.status === GAME_STATUS.NOT_STARTED && game.user.uid === auth.currentUser?.uid ){
          setActiveGameId(game.firestoreDocId)
          break
        }

      }

      for(const game of tempGames){
        if(game.status === GAME_STATUS.STARTED && (game.user.uid === auth.currentUser?.uid || game.participant.uid === auth.currentUser?.uid)){
          setSelectedGame(game)
          break
        }
      }


    })
    // return () => unsubscribe()

  }, [])

  const onCreateGameButtonClicked = () => {
    let hasActiveGame = false
    if (games) {
      for (let i = 0; i < games.length; i++) {
        const game = games[i]
        if (game) {
          if (
              game.winner === null && (game.user.uid === auth.currentUser?.uid || game.participant.uid === auth.currentUser?.uid)
          ) {
            hasActiveGame = true
            break
          }
        }
      }
    }

    if (hasActiveGame) {
      alert('There is active game!')
      return
    }

    setOpenCreateGame(true)
  }

  const onCreateGameClose = async (game?: Game) => {
    setOpenCreateGame(false)
    await client.refetchQueries({
      include: [QUERY_ALL_GAMES],
    })

    if(game){
      addDoc(gamesRef, {
        id: game.id,
        name: game.name,
        user: game.user,
        participant: game.participant,
        createdAt: serverTimestamp(),
        status: GAME_STATUS.NOT_STARTED,
      })
          .then(() => {

          })
          .catch((err) => {
            console.log(err)
          })
    }
  }

  const onGamePlayButtonClicked = (game: Game) => {
    const variables = {
      boardId: game.id,
      turn: {
        id: game.user.id,
      },
    }

    setTurn({ variables })
      .then(async () => {
        await client.refetchQueries({
          include: [QUERY_ALL_GAMES],
        })

        const docRef = doc(db, "games", activeGameId as string);

        updateDoc(docRef, {
          turn: game.user || null,
          status: GAME_STATUS.STARTED,
        })
          .then(docRef => {
            console.log("Value of an Existing Document Field has been updated");
          })
          .catch(error => {
            console.log(error);
          })
      })
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new Error(err)
      })
  }

  return (
    <Box>
      <Box display={'flex'} flexDirection={'row-reverse'}>
        <Button onClick={onCreateGameButtonClicked} endIcon={<AddIcon />}>
          Create Game
        </Button>
      </Box>
      {loader ? (
          <Loader loading={loader} />
      ) : (<TableContainer component={Paper}>
        <Table sx={{ minWidth: 250 }}>
          <TableHead>
            <TableRow>
              <TableCell>Game Name</TableCell>
              <TableCell>Game Host</TableCell>
              <TableCell>Participant</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              games.map((item) => (
                  <TableRow
                      key={item.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell component="th" scope="row">
                      {item.user.name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.participant.name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.winner?.name}
                    </TableCell>
                    <TableCell>
                      {item.status ? item.status : item.winner ? GAME_STATUS.FINISHED : GAME_STATUS.NOT_STARTED}
                    </TableCell>
                    <TableCell>
                      {!item.turn &&
                          !item.winner &&
                          item.user.uid === auth.currentUser?.uid && (
                              <IconButton
                                  color="primary"
                                  size={'large'}
                                  onClick={() => onGamePlayButtonClicked(item)}
                              >
                                <PlayArrowIcon />
                              </IconButton>
                          )}
                    </TableCell>
                  </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>) }


      {openCreateGame && (
        <CreateGame show={openCreateGame} onClose={onCreateGameClose} />
      )}
    </Box>
  )
}

export default GameList
