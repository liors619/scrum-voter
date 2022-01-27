const socket = io();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);


const urlUsername = urlParams.get('userName');
const urlRoomName = urlParams.get('roomName');

socket.emit("user-joined-to-room", urlUsername, urlRoomName);