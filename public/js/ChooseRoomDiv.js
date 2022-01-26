socket = io();

chooseRoomForm = document.getElementById("room-choose-form");
roomNameInput = chooseRoomForm[0];
userNameInput = chooseRoomForm[1];
userNameInputFeedback = document.getElementById("user-name-input-feedback");
roomNameInputFeedback = document.getElementById("room-name-input-feedback");


roomNameInput.addEventListener('input', RemoveFormIsInvalidClass);
userNameInput.addEventListener('input', ev => RemoveIsInvalidClass(ev.target));

chooseRoomForm.addEventListener("submit",(ev)=>{
    ev.preventDefault();
    
    const eventValue = 
    { 
        "roomName" : roomNameInput.value,
        "userName" : userNameInput.value
    }  
    
    const submitterBtnName = ev.submitter.name;
    let eventName = ""
    if (submitterBtnName == "join-room-btn")
        eventName = "join-room"
    else if (submitterBtnName == "create-room-btn")
        eventName = "create-room"

    socket.emit(eventName, eventValue);
});

socket.on("room-created", (roomName, username) => {
    console.log("room created");
    window.location.href = "/room.html?roomName=" + roomName + "&userName=" + username;
});

socket.on("room-already-exists", (errorMsg) => {
    roomNameInputFeedback.innerHTML = errorMsg;
    roomNameInput.classList.add("is-invalid");
    console.log("room already exists");
});

socket.on("room-not-found", (errorMsg) => {
    roomNameInputFeedback.innerHTML = errorMsg;
    roomNameInput.classList.add("is-invalid");
    console.log("room not found");
});

socket.on("room-joined", (roomName, username) => {
    console.log("room joined");
    window.location.href = "/room.html?roomName=" + roomName + "&userName=" + username;
});

socket.on("user-already-in-room", (errorMsg) => {
    userNameInputFeedback.innerHTML = errorMsg;
    userNameInput.classList.add("is-invalid");
    console.log("user already in room");
});

function ResetFormValue(form){
    form[0].value = "";
    form[1].value = "";
}

function RemoveFormIsInvalidClass(){
    roomNameInput.classList.remove("is-invalid");
    userNameInput.classList.remove("is-invalid");
}

function RemoveIsInvalidClass(element){
    element.classList.remove("is-invalid");
}