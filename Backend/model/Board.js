const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const boardSchema = new Schema({
    name: String,
    user: Schema.Types.ObjectId,
    participant: Schema.Types.ObjectId,
    winner: Schema.Types.ObjectId,
    turn: Schema.Types.ObjectId,
    backgroundColor: String,
    firestoreDocId: String
})

const Board = mongoose.model("Board", boardSchema)

module.exports = {Board}