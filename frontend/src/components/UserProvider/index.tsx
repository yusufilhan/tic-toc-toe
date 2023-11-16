import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { firebaseApp } from '../../firebase-config'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import {
  IUserContext,
  IUserCreateResponse,
  IUserFindResponse,
  IUserForm,
  User,
} from './Types'
import { gql, useMutation } from '@apollo/client'
import Loader from '../Loader'
import { Transition } from '../Transition'

export const UserContext = createContext<IUserContext>({
  user: null,
})

const defaultValues = {
  name: '',
}

const MUTATION_CREATE_USER = gql`
  mutation CreateUser($name: String!, $uid: String!) {
    createUser(name: $name, uid: $uid) {
      id
      name
      uid
    }
  }
`

const QUERY_FIND_USER = gql`
  mutation Mutation($uid: String!) {
    userByUid(uid: $uid) {
      id
      name
      uid
    }
  }
`

const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserForm>({
    defaultValues,
  })
  const [createUser, { loading }] =
    useMutation<IUserCreateResponse>(MUTATION_CREATE_USER)
  const [findUser] = useMutation<IUserFindResponse>(QUERY_FIND_USER)
  const auth = getAuth(firebaseApp)
  const [isUserNotFound, setIsUserNotFound] = useState(false)
  const [uid, setUid] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [openUserDialog, setOpenUserDialog] = useState<boolean>(true)

  useEffect(() => {
    signIn()
  }, [])

  useEffect(() => {
    if (uid) {
      checkUser()
    }
  }, [uid])

  const userContextValue = useMemo(() => ({ user, setUser }), [user])

  const checkUser = () => {
    findUser({ variables: { uid } })
      .then((response) => {
        if (response.data && response.data.userByUid) {
          setIsUserNotFound(false)
          setUser(response.data.userByUid)
        } else {
          setIsUserNotFound(true)
        }
      })
      .catch((reason) => {
        console.log(reason)
      })
  }

  const signIn = () => {
    signInAnonymously(auth)
      .then(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUid(user.uid)
          } else {
          }
        })
      })
      .catch(() => {
        throw new Error('User Logout')
        // const errorCode = error.code
        // const errorMessage = error.message
      })
  }

  const onSubmit: SubmitHandler<IUserForm> = (formData) => {
    createUser({ variables: { name: formData.name, uid } })
      .then((response) => {
        if (response.data) setUser(response.data?.createUser)
      })
      .catch((reason) => {
        console.log(reason)
      })
  }

  return (
    <Container
      maxWidth={'lg'}
      sx={{
        height: '100vh',
      }}
    >
      {loading && <Loader loading={loading} />}

      <UserContext.Provider value={userContextValue}>
        {user === null && isUserNotFound && (
          <Dialog
            open={openUserDialog}
            onClose={setOpenUserDialog}
            TransitionComponent={Transition}
            keepMounted
            hideBackdrop
          >
            <DialogTitle>Welcome Tic Toc Toe Game</DialogTitle>
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSubmit(onSubmit)}>Create</Button>
            </DialogActions>
          </Dialog>
        )}
        {user && children}
      </UserContext.Provider>
    </Container>
  )
}

export default UserProvider
