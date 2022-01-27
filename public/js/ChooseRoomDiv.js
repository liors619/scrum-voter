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
    
    const roomName = roomNameInput.value;
    const username = userNameInput.value;
    
    const submitterBtnName = ev.submitter.name;
    if (submitterBtnName == "join-room-btn")
        SubmitJoinRoomRequest(roomName, username);
    else if (submitterBtnName == "create-room-btn")
        SubmitCreateRoomRequest(roomName, username);
});

function SubmitJoinRoomRequest(roomName, userName){
    RemoveFormIsInvalidClass();
    fetch("/api/joinRoom?roomName=" + roomName + "&userName=" + userName, {method: "POST"})
    .then(response => {
        const status = response.status;
        console.log(response);

        if (status == 200){
            window.location.href = "/Room?roomName=" + roomName + "&userName=" + userName;
        }
        else {
            response.json().then(data => {
                const errorMsg = data.errorMsg;
                if (status == 404){
                    roomNameInputFeedback.innerHTML = errorMsg;
                    roomNameInput.classList.add("is-invalid");
                }
                else if (status == 400) {
                    userNameInputFeedback.innerHTML = errorMsg;
                    userNameInput.classList.add("is-invalid");
                }
            });
        }
    });
}

function SubmitCreateRoomRequest(roomName, userName){
    RemoveFormIsInvalidClass();
    fetch("/api/createRoom?roomName=" + roomName + "&userName=" + userName, {method: "POST"})
    .then(response => {
        const status = response.status;

        if (status == 200){
            window.location.href = "/Room?roomName=" + roomName + "&userName=" + userName;
        }
        else {
            response.json().then(data => {
                const errorMsg = data.errorMsg;
                roomNameInputFeedback.innerHTML = errorMsg;
                roomNameInput.classList.add("is-invalid");
                console.log("room not found");
            });
        }
    });
}

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
