import {Box, Modal, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {ITimerModal} from "./Types";

const TimerModal = ({close, isGameStarted}: ITimerModal) => {
  const [timerModal, setTimerModal] = useState<boolean>(true)
  const [timerText, setTimerText] = useState<number | string>(5)


  useEffect(() => {
    let timer: NodeJS.Timer
    if(!isGameStarted){
      setTimerModal(true)
      setTimerText(5)
      let count = 5
      timer = setInterval(() => {

        if (count === 0) {
          setTimerModal(false)
          close()
          clearInterval(timer)
          return
        }

        count--

        if(count === 0){
          setTimerText('Ready...')
        } else {
          setTimerText(count)
        }

      }, 1000)

    } else {
      close()
    }

    // return()=>{
    //   clearInterval(timer)
    //   setTimerModal(true)
    //   setTimerText(5)
    // }

  }, [isGameStarted])

  return (
      <>
        <Modal open={timerModal}>
          <Box
              sx={{
                position: 'absolute' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'background.paper',
                boxShadow: 24,
                p: 5,
              }}
          >
            <Typography variant={'body2'} sx={{ fontSize: '50px' }}>
              {timerText}
            </Typography>
          </Box>
        </Modal>
      </>

  )

}

export default TimerModal