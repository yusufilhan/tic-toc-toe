import { Transition } from '../Transition'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import React, { useContext, useEffect, useState } from 'react'
import {ICreateGame, ICreateGameForm, ICreateGameResponse} from './Types'
import { UserContext } from '../UserProvider'
import {ColorPicker, useColor} from 'react-color-palette'
import 'react-color-palette/css'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import UsersTable from '../UsersTable'
import { USER_TABLE_MOD } from '../UsersTable/Types'
import { User } from '../UserProvider/Types'
import { gql, useMutation } from '@apollo/client'

const MUTATION_CREATE_GAME = gql`
  mutation CreateGame($board: CreateBoardInput!) {
    createBoard(board: $board) {
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
    }
  }
`

const CreateGame = ({ show, onClose }: ICreateGame) => {
  const { user } = useContext(UserContext)
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ICreateGameForm>({})

  const [createGame] = useMutation<ICreateGameResponse>(MUTATION_CREATE_GAME)

  const [color, setColor] = useColor('blue')
  const [openColorPalette, setOpenColorPalette] = useState<boolean>(false)
  const [openParticipants, setOpenParticipants] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (user) {
      reset({
        name: '',
        user: user,
        backgroundColor: color,
      })
    }
  }, [user, reset])

  const onSubmit: SubmitHandler<ICreateGameForm> = (formData) => {
    const variables = {
      board: {
        name: formData.name,
        user: { id: formData.user?.id },
        participant: { id: formData.participant?.id },
        backgroundColor: formData.backgroundColor.hex,
      },
    }

    createGame({ variables: variables })
      .then((response) => {
        if(response.data){
          const game = response.data.createBoard

          onClose(game)

        }
      })
      .catch((reason) => {
        console.log(reason)
      })
  }

  return (
    <>
      <Dialog
        open={show}
        onClose={()=>onClose()}
        TransitionComponent={Transition}
        keepMounted
        hideBackdrop
        fullWidth
      >
        <DialogTitle>Create Game</DialogTitle>
        <DialogContent>
          <Controller
            render={({ field }) => {
              return (
                <TextField
                  margin="dense"
                  fullWidth
                  {...field}
                  variant={'standard'}
                  required
                  label={'Name'}
                  error={!!errors.name}
                />
              )
            }}
            rules={{ required: true, minLength: 3 }}
            control={control}
            name={'name'}
          />
          <Box display={'flex'} mt={2} alignItems={'center'}>
            <Controller
              render={({ field }) => {
                return (
                  <>
                    <Typography
                      sx={{ display: 'flex', fontWeight: 'bold' }}
                      variant={'body2'}
                    >
                      Background Color:
                    </Typography>
                    <Box
                      onClick={() => setOpenColorPalette(true)}
                      sx={{
                        backgroundColor: color.hex,
                        width: 50,
                        height: 30,
                        cursor: 'pointer',
                        display: 'flex',
                        ml: 1,
                      }}
                    />
                    <Dialog
                      open={openColorPalette}
                      onClose={setOpenColorPalette}
                      fullWidth
                    >
                      <DialogTitle>Pick Color</DialogTitle>
                      <DialogContent>
                        <ColorPicker
                          color={color}
                          onChange={(value) => {
                            field.onChange(value)
                            setColor(value)
                          }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          variant={'outlined'}
                          onClick={() => setOpenColorPalette(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={'contained'}
                          onClick={() => setOpenColorPalette(false)}
                        >
                          Pick
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )
              }}
              name={'backgroundColor'}
              rules={{ required: true }}
              control={control}
            />
          </Box>
          <Box display={'flex'} mt={2} alignItems={'center'}>
            <Controller
              render={({ field }) => {
                const onUserSelect = (user: User) => {
                  field.onChange(user)
                  setOpenParticipants(false)
                  setSelectedUser(user)
                }

                return (
                  <>
                    <Typography
                      sx={{
                        display: 'flex',
                        fontWeight: 'bold',
                        color: errors.participant ? 'red' : 'initial',
                      }}
                      variant={'body2'}
                    >
                      Participant:
                    </Typography>
                    {selectedUser && (
                      <Typography
                        sx={{ ml: 1, fontWeight: 'bold' }}
                        variant={'body1'}
                      >
                        {selectedUser.name}
                      </Typography>
                    )}
                    <IconButton
                      color="primary"
                      size={'large'}
                      onClick={() => setOpenParticipants(true)}
                    >
                      <HowToRegIcon />
                    </IconButton>
                    <Dialog
                      open={openParticipants}
                      onClose={setOpenParticipants}
                      fullWidth
                    >
                      <DialogTitle>Select Participant</DialogTitle>
                      <DialogContent>
                        <UsersTable
                          mode={USER_TABLE_MOD.SELECT}
                          onSelect={onUserSelect}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          variant={'outlined'}
                          onClick={() => setOpenParticipants(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={'contained'}
                          onClick={() => setOpenParticipants(false)}
                        >
                          Select
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )
              }}
              name={'participant'}
              rules={{ required: true }}
              control={control}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={() => onClose()}>
            Cancel
          </Button>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button variant={'contained'} onClick={handleSubmit(onSubmit)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CreateGame
