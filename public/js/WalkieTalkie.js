var socket = io();
var Usercounter = 0;

socket.on("connect", () => {
  socket.emit("join-room-walkie-talkie", ROOM_ID, user, ROOM_CATEGORY);
});

socket.on("audio final", function (audioChunks) {
  console.log(audioChunks);
  const audioBlob = new Blob(audioChunks);
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
});

// display initial user count when the first user joins the room
socket.on("init-user-count", function (usercount) {
  $(".usercount").text(usercount);
});

// update user count when a new user joins the room
socket.on("user", function (usercount) {
  console.log(usercount);
  $(".usercount").text(usercount);
});

// fungsi untuk memulai rekaman audio
function startRecording(mediaRecorder) {
  mediaRecorder.start();
  $(".play-button").toggleClass("paused");
}

// fungsi untuk menghentikan rekaman audio
function stopRecording(mediaRecorder) {
  if (mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    $(".play-button").toggleClass("paused");
  }
}

navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const mediaRecorder = new MediaRecorder(stream);
  var audioChunks = [];

  // event listener untuk tombol mouse
  $(".play-button")
    .on("mousedown touchstart", function (e) {
      startRecording(mediaRecorder);

      console.log(stream);
    })
    .bind("mouseup mouseleave touchend", function () {
      stopRecording(mediaRecorder);
    });

  // event listener untuk tombol spasi
  $(document)
    .on("keydown", function (e) {
      if (e.which === 32) {
        startRecording(mediaRecorder);
      }
    })
    .on("keyup", function (e) {
      if (e.which === 32) {
        stopRecording(mediaRecorder);
      }
    });

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });

  mediaRecorder.addEventListener("stop", () => {
    //socket.broadcast.emit('audioMessage', audioChunks);
    socket.emit("audioMessage", audioChunks);
    audioChunks = [];
  });
});
