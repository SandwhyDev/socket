const socket = io();

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
let people = [];
let userJoin = [];

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

// const user = prompt("Enter your name");
// const user = uuid();

var peer = new Peer({
  host: "/",
  port: 3030,
  path: "/peer",
  config: {
    iceServers: [
      { url: "stun:stun01.sipphone.com" },
      { url: "stun:stun.ekiga.net" },
      { url: "stun:stunserver.org" },
      { url: "stun:stun.softjoys.com" },
      { url: "stun:stun.voiparound.com" },
      { url: "stun:stun.voipbuster.com" },
      { url: "stun:stun.voipstunt.com" },
      { url: "stun:stun.voxgratia.org" },
      { url: "stun:stun.xten.com" },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
    ],
  },

  debug: true,
});

peer._debug = false;

let myVideoStream;

let AllUser = [];
const mediaUser = [];

navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    const addedUsers = [];

    // console.log(myVideoStream);

    // punya user sendiri
    addVideoStream(myVideo, stream, user);

    const video = document.createElement("video");

    peer.on("call", (call) => {
      call.answer(stream);

      call.on("stream", (userVideoStream) => {
        // console.log(userVideoStream);
        // tambahkan user yang sudah terkoneksi
        // tambahkan user baru
        socket.on("participants", (userJoin) => {
          userJoin.forEach((e) => {
            // mediaUser.push({ id: e.name, stream: userVideoStream });
            mediaUser.push(userVideoStream);

            let uniqueMediaUser = [...new Set(mediaUser)];

            uniqueMediaUser.map((i) => {
              if (e.name !== user && !addedUsers.includes(e.name)) {
                if (
                  $(document)
                    .find("#video-grid")
                    .find("video[id='" + e.name + "']").length == 0
                ) {
                  addedUsers.push(e.name);

                  // console.log(i);

                  // console.log(e.name, userVideoStream);
                  addVideoStream(video, i, e.name);
                } else {
                  // console.log(3);
                }
              }
            });

            
          });
        });
      });
    });

    socket.on("user-connected", (userId, userName) => {
      // console.log(userName);
      connectToNewUser(userId, stream, userName);
    });
  });

const connectToNewUser = (userId, stream, userName) => {
  let userJoin = [];

  userJoin.push(userName);

  socket.emit("ask-join", userId, userName);

  // socket.on("wait to host", (message, userId, userName) => {
  //   console.log(message, userId, userName);
  // });

  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    // untuk ke host
    addVideoStream(video, userVideoStream, userName);
  });
};

socket.on("ijin host", (idUser, userName) => {
  console.log(`${userName} ingin join`);
  let ijin = confirm(`${userName} ingin join`);

  // if (!ijin) {
  //   socket.emit("ijin masuk", false, userName, idUser);
  //   return false;
  // }

  socket.emit("ijin masuk", true, userName, idUser);
});

peer.on("open", (id) => {
  // console.log("my id is" + id);

  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream, user) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    video.id = user;

    console.log(video);
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let foto = $("#image-container");
let messages = document.querySelector(".messages");
let imageTest = document.querySelector("#photo");
const imageimage = $("#photo");
var sendFoto = "";

function batalSendImage(filename) {
  socket.emit("delete file", filename);
  foto.empty();
  sendFoto = "";
}

imageimage.on("change", () => {
  const file = imageimage[0].files[0];
  let filename = URL.createObjectURL(file);

  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = () => {
    socket.emit("send file", {
      name: file.name,
      data: reader.result,
      size: file.size,
      mimetype: file.type,
    });
  };

  socket.on("gambar", (file) => {
    sendFoto = file;

    const image = $("<img>").attr(
      "src",
      `http://localhost:3030/images/${file}`
    );

    const BatalSend = `<p class="batal-send-image" onclick="batalSendImage('${file}')">X</p>`;

    foto.html(image).append(BatalSend);
  });
});

send.addEventListener("click", async (e) => {
  if (text.value.length !== 0 && sendFoto != null) {
    socket.emit("message", text.value, sendFoto);

    console.log(foto);
    text.value = await "";
    await foto.empty();
    sendFoto = await "";
  } else if (text.value.length === 0 && sendFoto === null) {
    return false;
  } else if (sendFoto.length != 0 && text.value.length === 0) {
    console.log(sendFoto.length);
    socket.emit("message", text.value, sendFoto);
    // console.log("test foto doang");
    await foto.empty();

    sendFoto = await "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value, sendFoto);
    text.value = "";

    foto.removeAttr("src");
  } else if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);

    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href.split("/")[3]
  );
});

socket.on("createMessage", (message, sendFoto, userName) => {
  console.log(userName, message.length);
  console.log("foto ", sendFoto);

  if (sendFoto.length != 0 && message.length != 0) {
    console.log("test foto dan text");

    {
      userName === user
        ? (messages.innerHTML =
            messages.innerHTML +
            `<div class="message" id="chatsaya">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <div class="image_message">
             <img src="http://localhost:3030/images/${sendFoto}" alt="Girl in a jacket" >
             </div>

        <span>${message} </span>
    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${
        userName === user ? "me" : userName
      }</span> </b>
      <div class="image_message">
           <img src="http://localhost:3030/images/${sendFoto}" alt="Girl in a jacket" >
           </div>

      <span>${message} </span>
  </div>`);
    }
    return;
  } else if (sendFoto.length != 0 && message.length === 0) {
    console.log("test foto doang");
    {
      userName === user
        ? (messages.innerHTML =
            messages.innerHTML +
            `<div class="message" id="chatsaya">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <div class="image_message">
             <img src="http://localhost:3030/images/${sendFoto}" alt="Girl in a jacket" >
             </div>

    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${
        userName === user ? "me" : userName
      }</span> </b>
      <div class="image_message">
           <img src="http://localhost:3030/images/${sendFoto}" alt="Girl in a jacket" >
           </div>

  </div>`);
    }
    return;
  } else {
    {
      userName === user
        ? (messages.innerHTML =
            messages.innerHTML +
            `<div class="message" id="chatsaya">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${
        userName === user ? "me" : userName
      }</span> </b>
      <span>${message} </span>
  </div>`);
    }
    return;
  }
});

socket.on("finale", (message, user, participants) => {
  if (message === false) {
    console.log(message, user);
    window.location.href = "/";
    return;
  } else {
    // console.log(participants);
    return;
  }
});

socket.on("user-disconnected", (userId, userName) => {
  console.log(userName + " keluar ");
  const video = document.getElementById(userName);

  console.log(video);
  if (video) {
    video.remove();
  }
});
