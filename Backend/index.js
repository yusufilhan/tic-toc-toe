const {ApolloServer} = require("apollo-server")
const {typeDefs} = require("./graphql/schema")
const {resolvers} = require("./graphql/resolvers")
const mongoose = require("mongoose");

// const MONGO_URI = "mongodb://localhost:27017/tic-tac-toe";
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@cluster0.7hfr9g8.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;


// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Db Connected`);
  })
  .catch(err => {
    console.log(err.message);
  });


const server = new ApolloServer({typeDefs, resolvers})

server.listen().then(({url})=> {
    console.log(`Api is runnig at: ${url}`)
})