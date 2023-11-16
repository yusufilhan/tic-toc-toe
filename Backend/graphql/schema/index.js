const {gql} = require("apollo-server")

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        uid: String!
    }

    input UserInput {
        id: ID!
    }

    type Board {
        id: ID!
        name: String!
        user: User!
        participant: User
        winner: User
        turn: User
        backgroundColor: String!
        firestoreDocId: String
    }

    type Query {
        users: [User!]!
        user(uid:String!): User
        boards: [Board!]!
        activeBoards: [Board!]!
        board(id: ID!): Board!
        boardByUser(user: UserInput): Board!
    }

    input CreateBoardInput {
        name: String!
        user: UserInput!
        participant: UserInput
        backgroundColor: String!
    }
    
    type Mutation {
        createUser(name: String!, uid: String!): User!
        createBoard(board: CreateBoardInput!): Board!
        addParticipant(boardId: ID!, participant: UserInput!): Board!
        addWinner(boardId: ID!, winnerId: String!) : Board!
        setTurn(boardId: ID!, turn: UserInput!) : Board!
        setFirestoreDocId(boardId: ID!, docId: String): Board
        userByUid(uid: String!): User
        users: [User!]!
    }
`

module.exports = {typeDefs} 