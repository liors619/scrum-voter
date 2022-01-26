const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new mongoose.Schema({
    id: String,
    lastJoinTime: Date,
    Users: [{name: String, isVoter: Boolean}],
    Votes: [{UserName: String, Vote: String}]
});

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
