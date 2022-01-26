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
mongoose.connect("mongodb://localhost:27017/ScrumVoterDb", { useNewUrlParser: true});
ClearDb() 
RoomModel.find({}).then(res => {console.log(res)});
console.log("connected to DB.");

app.use("/", express.static(publicFolderPath, {index: false}));
app.get('/', (_req, res) => {
    res.sendFile(Path.join(publicFolderPath, 'index.html'));
});

app.get('/room.html', (_req, res) => {
  res.sendFile(Path.join(publicFolderPath, 'roomPage.html'));
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log();
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log();
  });

  socket.on('join-room', ({roomName, userName}) => {
      console.log("join room submitted");
      RoomModel.findOne({id: roomName}, (_error,res) => {
        if (res == null) {
          console.log("room " + roomName + " was not found")
          socket.emit('room-not-found', "room " + roomName + " was not found");
        }
        else {
          if (res.Users.map(x => x.name).includes(userName)) {
            socket.emit('user-already-in-room', "user with this name is already in the room.");
            console.log("A user with the same username is already in the room");
          }
          else {
            socket.emit('room-joined', roomName, userName);
            console.log("user " + userName + " joined room " + roomName);
          }
        }
        console.log();
      });
  });

  socket.on('create-room', ({roomName, userName}) => {
    console.log("create room submitted");
    RoomModel.findOne({id: roomName}, (_error,res) => {
      if (res == null) {
        var newRoom = new RoomModel({
          id: roomName, 
          lastJoinTime: new Date()});
        newRoom.save();
        socket.join(roomName);
        socket.emit('room-created', roomName, userName);
        console.log("room " + roomName + " created");
      }
      else {
        socket.emit('room-already-exists', "room with this name is already exists.");
        console.log("room " + roomName + " already exists");
      }
      
      console.log();
    });
    
  });
});

function ClearDb(){
    RoomModel.deleteMany({}).exec();
}

