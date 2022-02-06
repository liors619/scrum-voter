const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Path = require('path');
const publicFolderPath = Path.join(__dirname, '../public')

const mongoose = require('mongoose');
const RoomModel = require("./RoomMongoSchema.js");
const { db } = require('./RoomMongoSchema.js');
mongoose.connect("mongodb://localhost:27017/ScrumVoterDb", { useNewUrlParser: true});
ClearDb()
new RoomModel({
  id: "Trace", 
  lastJoinTime: new Date()}).save();

RoomModel.find({}).then(res => {console.log(res)});
console.log("connected to DB.");

app.use("/", express.static(publicFolderPath, {index: false}));
app.get('/', (_req, res) => {
    res.sendFile(Path.join(publicFolderPath, 'index.html'));
});

app.get('/Room', (req, res) => {
  const roomName = req.query.roomName;
  const userName = req.query.userName;

  RoomModel.findOne({ id: roomName }, (_error, dbRes) => {
    if (dbRes == null)
      res.status(404).send("room not found.");
    else if (dbRes.Users.filter(user => user.name === userName).length !== 0){
      res.status(404).send("user with this name already conneted");
    }
    else {
      res.sendFile(Path.join(publicFolderPath, 'roomPage.html'));
    }
  });
});

app.post('/api/createRoom', (req, res) => {
  const roomName = req.query.roomName;
  const userName = req.query.userName;

  console.log("create room submitted");
  RoomModel.findOne({id: roomName}, (_error,mongoRes) => {
    if (mongoRes == null) {
      var newRoom = new RoomModel({
        id: roomName, 
        lastJoinTime: new Date(),
        Users: [{ name: userName, isVoter: true }]});
      newRoom.save();
      console.log("room " + roomName + " created");
      res.send();
    }
    else {
      console.log("room " + roomName + " already exists");
      res.status(400).send(JSON.stringify({errorMsg: "room with this name is already exists."}));
    }
  console.log();
  });
});


app.post('/api/joinRoom', (req, res) => {
  const roomName = req.query.roomName;
  const userName = req.query.userName;
  console.log("join room submitted");
  RoomModel.findOne({id: roomName}, (_error,dbRes) => {
    if (dbRes == null) {
      console.log("room " + roomName + " was not found");
      res.status(404).send(JSON.stringify({errorMsg: "room with this name is not exists."}));
    }
    else {
      if (dbRes.Users.map(x => x.name).includes(userName)) {
        console.log("A user with the same username is already in the room");
        res.status(400).send(JSON.stringify({errorMsg: "user with this name is already in the room."}));
      }
      else {
        console.log("user " + userName + " ask to join room " + roomName);
        res.send();
      }
    }
    console.log();
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  socket.join(getSocketRoomName(socket));
  console.log("user " + getSocketUserName(socket) + " connected to room " + getSocketRoomName(socket));

  // add user to the room and emit "user-connected-to-room" event
  RoomModel.findOne({id: getSocketRoomName(socket)}, (_error,dbRes) => {
    if (dbRes != null) {
      dbRes.Users.push({ name: getSocketUserName(socket), isVoter: true });
      dbRes.save();
      socket.emit("room-data-ready", { users: dbRes.Users, votes: dbRes.votes });
      socket.broadcast.to(getSocketRoomName(socket)).emit("user-connected-to-room", getSocketUserName(socket));
    }
    else
      console.log("unepected error");
  });
  console.log();

  // remove the user from the room and emit "user-disconnected-from-room" event
  socket.on('disconnect', () => {
    console.log(socket);
    RoomModel.findOne({id: getSocketRoomName(socket)}, (_error,dbRes) => {
      if (dbRes != null) {
        dbRes.Users= dbRes.Users.filter(user => user.name !== getSocketUserName(socket));
        dbRes.save();
        io.to(getSocketRoomName(socket)).emit("user-disconnected-from-room", getSocketUserName(socket));
      }
      else
        console.log("unepected error");
    });
    console.log();
  });
});

function getSocketRoomName(socket){
  return socket.handshake.query.roomName;
}

function getSocketUserName(socket){
  return socket.handshake.query.userName;
}

function ClearDb(){
    RoomModel.deleteMany({}).exec();
}

