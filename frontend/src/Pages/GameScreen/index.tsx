import {Box, Button, Grid, Paper, Typography} from '@mui/material'
import { useEffect, useState } from 'react'
import {useNavigate, useParams} from 'react-router'
import TimerModal from "../../components/TimerModal";
import {gql, useMutation, useQuery} from "@apollo/client";
import {updateDoc, doc, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where, getDocs} from "firebase/firestore";
import {db, firebaseApp} from "../../firebase-config";
import {IGameResponse, ISetAddWinnerResponse, ISetDocIdResponse} from "./Types";
import {getAuth} from "firebase/auth";
import {GAME_STATUS} from "../GameList/Types";
import showConfirmDialog from "../../components/ConfirmDialog";

const QUERY_BOARD = gql`
  query Board($boardId: ID!) {
    board(id: $boardId) {
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
      firestoreDocId
    }
  }
`

const MUTATION_SET_DOC_ID = gql`
  mutation SetDocId($boardId: ID!, $docId: String) {
    setFirestoreDocId(boardId: $boardId, docId: $docId) {
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
      firestoreDocId
    }
  }
`

const MUTATION_ADD_WINNER = gql`
  mutation AddWinner($boardId: ID!, $winnerId: String!) {
    addWinner(boardId: $boardId, winnerId: $winnerId) {
      id
      name
      winner {
        id
        name
        uid
      }
    }
  }
`

const fillArr = [Array(9).fill(null)]

let turn: string | null = null
let activeFirestoreGameId: string | null = null

const GameScreen = () => {
  const params = useParams();
  const auth = getAuth(firebaseApp)
  const navigate = useNavigate()

  const {
    data: gameResponse
  } = useQuery<IGameResponse>(QUERY_BOARD, {
    variables: { boardId: params.id },
  })

  const [setDocId] = useMutation<ISetDocIdResponse>(MUTATION_SET_DOC_ID)
  const [addWinner] = useMutation<ISetAddWinnerResponse>(MUTATION_ADD_WINNER)

  const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
  const [history, setHistory] = useState(fillArr);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [finish, setFinish] = useState<boolean>(false)
  const [activeMoveId, setActiveMoveId] = useState<string | undefined>(undefined)

  const moveRef = collection(db, 'moves')

  useEffect(() => {
    if(gameResponse?.board){
      setActiveMoveId(gameResponse.board.firestoreDocId)
      getGameFromFireStore(gameResponse.board.id)
      writeCurrentSquaresToFireStore()
    }

  }, [gameResponse]);

  useEffect(() => {
    if(params.id && gameResponse){
      const queryGame = query(
          moveRef,
          where('id', '==', params.id),
          orderBy('createdAt')
      )
      let tempData: any[] = []

      const unsubscribe = onSnapshot(queryGame, (snapshot) => {
        tempData = []
        snapshot.forEach((doc) => {
          tempData.push({ ...doc.data(), docId: doc.id })
        })
        if (tempData.length > 0) {

          const moves = JSON.parse(tempData[tempData.length -1].moves)

          let currentSquares = moves[moves.length -1]

          const winner = calculateWinner(currentSquares);

          if (winner) {
            handleFinish()
          } else {
            setActiveMoveId(tempData[0].docId)
            turn = tempData[tempData.length -1].turn
            setHistory(moves)
            setCurrentMove(moves.length -1)
            if(!currentSquares.includes(null)){
              resetGames()
            }
          }
        }
      })
      return () => {
        unsubscribe()
        setIsGameStarted(false)
        setCurrentMove(0)
        setHistory(fillArr)
      }
    }

  }, [params, gameResponse]);

  useEffect(() => {
    if(gameResponse?.board){
      if(!turn)
        turn = gameResponse.board.turn?.uid as string
    }
  }, [gameResponse]);

  useEffect(() => {

  }, [currentSquares]);

  const handleFinish = () => {
    setFinish(true)
    const variables = {
      boardId: gameResponse?.board.id,
      winnerId: turn,
    }

    addWinner({ variables })
        .then((response)=> {

          const docRef = doc(db, "games", activeFirestoreGameId as string);

          updateDoc(docRef, {
            status: GAME_STATUS.FINISHED,
            winner: response.data?.addWinner.winner
          })
              .then(() => {

                showConfirmDialog({
                  title: 'Finished',
                  content: <Box textAlign={'center'}>
                    <Typography variant={'body2'} sx={{fontSize: '30px'}}>
                      Winner is
                    </Typography>
                    <Typography variant={'body1'} sx={{fontWeight: 'bold', fontSize: '50px'}}>
                      {response.data?.addWinner.winner?.name}
                    </Typography>
                  </Box>,
                  showCloseButton: false,
                  buttons: [
                    {
                      label: 'Game List',
                      variant: 'contained',
                      callBack: ()=> {
                        turn = null
                        activeFirestoreGameId = null
                        navigate('/')
                      }
                    }
                  ]
                })
              })
              .catch(error => {
                console.log(error);
              })


        })
  }

  const getGameFromFireStore = (gameId: string) => {
    const gameRef = collection(db, 'games')
    getDocs(gameRef).then((response)=>{
      response.forEach(doc => {
        if(doc.data().id === gameId){
          activeFirestoreGameId = doc.id
        }
      })
    })
  }

  const writeCurrentSquaresToFireStore = () => {

    if(!gameResponse?.board.firestoreDocId && auth.currentUser?.uid === gameResponse?.board.user.uid){
      addDoc(moveRef, {
        id: gameResponse?.board?.id,
        moves: JSON.stringify(history),
        createdAt: serverTimestamp(),
        user: gameResponse?.board.user.uid,
        participant: gameResponse?.board.participant.uid,
        turn: gameResponse?.board.user.uid
      }).then((response)=> {

        const variables = {
          boardId: gameResponse?.board.id,
          docId: response.id,
        }

        setDocId({ variables })
            .then((gameResponse)=> {
              setActiveMoveId(gameResponse.data?.setFirestoreDocId.firestoreDocId)
            })
      })
    }

  }

  const updateCurrentSquares = (nextHistory: any[][]) => {
    const docRef = doc(db, "moves", activeMoveId as string);

    updateDoc(docRef, {
      moves: JSON.stringify(nextHistory),
      turn: turn === gameResponse?.board.user.uid ? gameResponse?.board.participant.uid : gameResponse?.board.user.uid
    })
      .then(()=> {
        // setHistory(nextHistory);
        // setCurrentMove(nextHistory.length - 1);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const resetGames = () => {
    setIsGameStarted(false)
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setFinish(false)
  }
  
  const onSquareClick = (index: number) => {
    if (calculateWinner(currentSquares) || currentSquares[index]) {
      return;
    }

    if(turn && turn !== auth.currentUser?.uid){
      return;
    }

    const nextSquares = currentSquares.slice();
    if (xIsNext) {
      nextSquares[index] = 'X';
    } else {
      nextSquares[index] = 'O';
    }

    handlePlay(nextSquares)
  }
  
  const handlePlay = (nextSquares: any[]) => {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    updateCurrentSquares(nextHistory)
  }
  
  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }
  
  const drawSquare = (value: number | null, index: number) => {
    return(

        <Button
            variant={'text'}
            sx={{width: '100%', height: '100%', border: '1px solid', fontSize: '50px', color: gameResponse?.board.backgroundColor, filter: 'invert(100%)'}}
            onClick={()=> onSquareClick(index)}
            disabled={finish}
        >
          {value}
        </Button>
    )
  }
  
  const drawBoard = () => {

    return(
        <Grid container width={'300px'} sx={{m: 2, backgroundColor: gameResponse?.board.backgroundColor}}>
          {
            currentSquares.map((item, index)=>{
              return(
                  <Grid key={'grid_' + index} item width={'100px'} height={'100px'}>
                    {
                      drawSquare(item, index)
                    }
                  </Grid>
              )
            })
          }
        </Grid>
    )
  }

  const drawTurn = () => {
    let active = false
    if(turn === auth.currentUser?.uid){
      active = true
    }

    let sign = 'O'

    if(xIsNext){
      sign = 'X'
    }

    return(
        <>
          <Box display={'flex'}>
            <Typography variant={'body1'} sx={{fontSize: '40px', opacity: active ? '1': '0.5', fontWeight:'bold' }}>
              {active ? 'Your Turn ' : 'Opponent Turn '}
              {`'${sign}'`}
            </Typography>
          </Box>
        </>
    )
  }

  return (
    <>
      <TimerModal isGameStarted={isGameStarted} close={()=> setIsGameStarted(true)}/>
      {isGameStarted && <Paper sx={{justifyContent: 'center', display: 'flex', mt: 2, flexDirection: 'column', alignItems: 'center'}}>
        {
          drawTurn()
        }
        {
          drawBoard()
        }
      </Paper>}
    </>
  )
}

export default GameScreen
