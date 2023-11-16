const {User} = require("../../model/User")
const {Board} = require("../../model/Board")


const resolvers = {
    Query:{
        // USER RESOLVERS
        users: async () => await  User.find({}),
        user: async (_, args) => {
            try{
                return await User.findOne(args)
            } catch(err){
                throw new Error("User Not found");
            }
            
        },

        // BOARD RESOLVERS
        boards: async (_, args) => {
            const boards = await Board.find({})
            let boardList = []
            for(const board of boards){
                const user = await User.findById(board.user)
                const participant = await User.findById(board.participant)
                const turnUser = await User.findById(board.turn)
                const winner = await User.findById(board.winner)
                
                const obj = {
                    name: board.name,
                    id: board.id,
                    user: {
                        id: user.id,
                        name: user.name,
                        uid: user.uid
                    },
                    participant: {
                        id: participant.id,
                        name: participant.name,
                        uid: participant.uid
                    },
                    turn: turnUser ? {
                        id: turnUser.id,
                        name: turnUser.name,
                        uid: turnUser.uid
                    } : null,
                    winner: winner ? {
                        id: winner.id,
                        name: winner.name,
                        uid: winner.uid
                    } : null,
                    backgroundColor: board.backgroundColor
                }
                boardList.push(obj)
            }
            return boardList
        },
        activeBoards: async (_, args) => {
            const boards = await Board.find({})
            let boardList = []
            for(const board of boards){
                if(board.winner === null){
                    const user = await User.findById(board.user)
                    const participant = await User.findById(board.participant)
                    const turnUser = await User.findById(board.turn)
                    const winner = await User.findById(board.winner)
                
                    const obj = {
                        name: board.name,
                        id: board.id,
                        user: {
                            id: user.id,
                            name: user.name,
                            uid: user.uid
                        },
                        participant: {
                            id: participant.id,
                            name: participant.name,
                            uid: participant.uid
                        },
                        turn: turnUser ? {
                            id: turnUser.id,
                            name: turnUser.name,
                            uid: turnUser.uid
                        } : null,
                        winner: winner ? {
                            id: winner.id,
                            name: winner.name,
                            uid: winner.uid
                        } : null,
                        backgroundColor: board.backgroundColor
                    }
                    boardList.push(obj)
                }
                
            }
            return boardList
        },
        board: async (_, args) => {
            const board = await Board.findById(args.id)
            const user = await User.findById(board.user)
            const participant = await User.findById(board.participant)
            const turnUser = await User.findById(board.turn)
            const winner = await User.findById(board.winner)
            return {
                name: board.name,
                id: board.id,
                user: {
                    id: user.id,
                    name: user.name,
                    uid: user.uid
                },
                participant: {
                    id: participant.id,
                    name: participant.name,
                    uid: participant.uid
                },
                turn: turnUser ? {
                    id: turnUser.id,
                    name: turnUser.name,
                    uid: turnUser.uid
                } : null,
                winner: winner ? {
                    id: winner.id,
                    name: winner.name,
                    uid: winner.uid
                } : null,
                backgroundColor: board.backgroundColor,
                firestoreDocId: board.firestoreDocId
            }
        },
        boardByUser: async(_, args) => await Board.findOne({user: args.user.id})
    },
    Mutation: {
        userByUid: async (_, args)=> {
            try {
                const user = await User.findOne(args)
                return user
            } catch(err){
                throw new Error("Error finding user");
            }
        },
        createUser: async (_, args) => {
            try {
                const {name, uid} = args

                const newUser = new User({
                    name,
                    uid
                })
                await newUser.save()
                return newUser
            } catch(err) {
                throw new Error("Error creating user");
            }
            
        },
        createBoard: async (_, args) => {
            
            try{
                const {name, user, participant, backgroundColor} = args.board
                const _user = await User.findById(user.id)
                let _participant = null;
                if(participant){
                    _participant = await User.findById(participant.id)
                }

                if(user){
                    const newBoard = new Board({
                        name,
                        user: _user._id,
                        participant: _participant ? _participant._id : null,
                        backgroundColor,
                        winner: null,
                        turn: null
                    })
                    await newBoard.save()
                    return {
                        id: newBoard._id,
                        name,
                        user: _user,
                        participant: _participant,
                        backgroundColor,
                        winner: null,
                        turn: null
                    }
                
                } else {
                    throw new Error("User not found");
                }
            } catch (err){
                throw new Error("Error creating board");
            }
            
        },
        addParticipant: async (_, args) => {
        
            try {
                const {boardId, participant} = args
                const user = await User.findById(participant.id)
                if(user){
                    const board = await Board.findByIdAndUpdate(boardId, {
                        participant: user
                    })
                    return board
                }
                
            } catch(err){
                throw new Error("Error adding second user");
            }
            
        },
        setTurn: async(_, args) => {
            try{
                const {boardId, turn} = args
                const turnUser = await User.findById(turn.id)
                const board = await Board.findByIdAndUpdate(boardId, {
                    turn: turnUser.id
                })

                const _user = await User.findById(board.user)
                const participantUser = await User.findById(board.participant)

                return {
                    id: board.id,
                    name:board.name,
                    user: _user,
                    participant: participantUser,
                    backgroundColor: board.backgroundColor,
                    winner: null,
                    turn: turnUser
                }
            } catch(err){
                throw new Error("Error setting turn");
            }
            

        },
        setFirestoreDocId: async(_, args)=> {
            try{
                const {boardId, docId} = args
                const board = await Board.findByIdAndUpdate(boardId, {
                    firestoreDocId: docId
                })
                const _turn = await User.findById(board.turn)
                const _user = await User.findById(board.user)
                const _participant = await User.findById(board.participant)
                return {
                    id: board.id,
                    name:board.name,
                    user: _user,
                    participant: _participant,
                    backgroundColor: board.backgroundColor,
                    winner: null,
                    turn: _turn,
                    firestoreDocId: docId
                }
            } catch(err){
                throw new Error("Error setting turn");
            }
        },
        addWinner: async(_, args) => {
            try{
                const {boardId, winnerId} = args
                const winnerUser = await User.find({uid: winnerId})

                const board = await Board.findByIdAndUpdate(boardId, {
                    winner: winnerUser[0].id,
                })

                return {
                    id: board.id,
                    name: board.name,
                    winner: winnerUser[0]
                }
            } catch(err){
                throw new Error("Error setting winner");
            }
            
        },
        users: async (_, args) => {
            try{
                const users = await User.find({})
                return users
            } catch(err){

            }
        }
    }
}

module.exports = {resolvers}