const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const urlUsername = urlParams.get('userName');
const urlRoomName = urlParams.get('roomName');

const socket = io('',  { query:"roomName=" + urlRoomName + "&userName=" + urlUsername });





titleH1 = document.getElementById("room-title");
titleH1.innerHTML = urlRoomName + " room";

let numberOfVoters = 0;

socket.on("room-data-ready", (users) => {
    users.forEach(user => {
        AddUserToOnlineUsersList(user.name)
        if (user.isVoter)
            numberOfVoters += 1;
    });
});

socket.on("user-connected-to-room", (userName) => {
    AddUserToOnlineUsersList(userName);
});

socket.on("user-disconnected-from-room", (userName) => {
    RemoveUserFromOnlineUsersList(userName);
});



const voteButtons = document.querySelectorAll('.vote-option-button')
voteButtons.forEach(voteButton => {
    voteButton.addEventListener('click', () => Vote(voteButton.value));
  });

  function Vote(value){
    console.log(urlUsername + " voted:" + value);
    voteButtons.forEach(voteButton => { voteButton.disabled = true });
}


userNamesListElement = document.getElementById("online-users-list");
function AddUserToOnlineUsersList(userName){
    const userElementInNameList = document.createElement("li")
    userElementInNameList.classList.add("user-il");
    userElementInNameList.appendChild(document.createTextNode(userName));
    userNamesListElement.appendChild(userElementInNameList);
}

function RemoveUserFromOnlineUsersList(userName){
    const userElementInNameList = Array.from(document.querySelectorAll("li.user-il")).filter(x => x.innerHTML === userName)[0];
    userElementInNameList.remove();
} 


