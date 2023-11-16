import React from 'react'
import UserProvider from './components/UserProvider'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { Box, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import ContentLayout from './ContentLayout'
import NiceModal from "@ebay/nice-modal-react";

function App() {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'http://localhost:4000/graphql',
  })

  return (
    <ApolloProvider client={client}>
      <CssBaseline />
      <BrowserRouter>
        <UserProvider>
            <NiceModal.Provider>
              <ContentLayout />
            </NiceModal.Provider>
        </UserProvider>
      </BrowserRouter>
    </ApolloProvider>
  )
}

export default App
