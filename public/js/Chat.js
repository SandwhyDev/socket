var socket = io();

function parseTime(timeString) {
  // Memecah string waktu menjadi komponen tanggal dan waktu
  const [dateString, time] = timeString.split("T");

  // Memecah komponen tanggal menjadi komponen tahun, bulan, dan hari
  const [year, month, day] = dateString.split("-");

  // Memecah komponen waktu menjadi komponen jam, menit, dan detik
  const [hour, minute, second] = time.slice(0, -1).split(":");

  // Membuat objek Date baru dari komponen tanggal dan waktu
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Mengembalikan objek Date dalam format tanggal, bulan, tahun, dan waktu
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

socket.on("connect", () => {
  socket.emit("join-room-chat", ROOM_ID, user, ROOM_CATEGORY);
});

// display initial user count when the first user joins the room
socket.on("init-user-count", function (usercount) {
  $(".user").text(usercount);
});

socket.on("user", (msg) => {
  $(".user").text(msg);
});

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let foto = $("#image-container");
let messages = document.querySelector(".messages");
let imageTest = document.querySelector("#photo");
const imageimage = $("#photo");
var sendFoto = "";
var mimetypeFoto = "";
var sizeFoto = "";

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
      file: file,
      name: file.name,
      data: reader.result,
      size: file.size,
      mimetype: file.type,
    });
  };

  socket.on("gambar", (gambar, file) => {
    sendFoto = gambar;
    mimetypeFoto = file.mimetype;
    sizeFoto = file.size;

    const image = $("<img>").attr("src", `http://localhost:3030/images/${gambar}`) .attr("id", "foto_review");

    const BatalSend = `<p class="batal-send-image" onclick="batalSendImage('${gambar}')">X</p>`;

    foto.html(image).append(BatalSend);
  });
});

send.addEventListener("click", async (e) => {
  if (text.value.length !== 0 && sendFoto != null) {
    socket.emit("message", text.value, sendFoto, ROOM_ID, user);

    // console.log(mimetypeFoto, sizeFoto);
    text.value = await "";
    await foto.empty();
    sendFoto = await "";
  } else if (text.value.length === 0 && sendFoto === null) {
    return false;
  } else if (sendFoto.length != 0 && text.value.length === 0) {
    // console.log(sendFoto.length);
    socket.emit("message", text.value, sendFoto, ROOM_ID, user, mimetypeFoto, sizeFoto);
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

socket.on("sendMessage", (message, sendFoto, userName, mimetypeFoto, sizeFoto) => {
  const file = imageTest.files[0];

  const foto = {
    name: sendFoto,
    mimetype: mimetypeFoto,
    size: sizeFoto,
  };

  const data = {
    user: user,
    message: message,
    room_id: ROOM_ID,
    foto: foto,
  };


  if (data.user === userName) {
    const formData = new FormData();
    formData.append("user", userName);
    formData.append("message", message);
    formData.append("room_id", ROOM_ID);
    formData.append("foto", file);

    fetch("http://localhost:3030/api/chat/create", {
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  }

  const date = new Date();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sendFoto.length != 0 && message.length != 0) {
    // console.log("test foto dan text");

    {
      userName === user
        ? (messages.innerHTML =
            messages.innerHTML +
            `<div class="message" id="chatsaya">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
        <div class="image_message">
             <img src="http://localhost:3030/images/${sendFoto}" class="fotochat" alt="foto_chat" >
             </div>

        <span>${message} </span>
        <p class="time_message">${time}</p>

    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
      <div class="image_message">
           <img src="http://localhost:3030/images/${sendFoto}" class="fotochat" alt="foto_chat" >
           </div>

      <span>${message} </span>
      <p class="time_message">${time}</p>

  </div>`);
    }
    return;
  } else if (sendFoto.length != 0 && message.length === 0) {
    // KIRIM FOTO TANPA MESSAGE

    {
      userName === user
        ? (messages.innerHTML =
            messages.innerHTML +
            `<div class="message" id="chatsaya">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
        <div class="image_message">
             <img src="http://localhost:3030/images/${sendFoto}" class="fotochat" alt="foto_chat" >
      <p class="time_message">${time}</p>

             </div>

    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
      <div class="image_message">
           <img src="http://localhost:3030/images/${sendFoto}" class="fotochat" alt="foto_chat" >
      <p class="time_message">${time}</p>

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
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
        <span>${message}</span>
        <p class="time_message">${time}</p>

    </div>`)
        : (messages.innerHTML =
            messages.innerHTML +
            `<div class="message">
      <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>
      <span>${message} </span>
      <p class="time_message">${time}</p>

  </div>`);
    }
    return;
  }
});

const dataRead = {
    room_id: ROOM_ID,
  
};

fetch("http://localhost:3030/api/chat/read", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(dataRead),
})
  .then((response) => response.json())
  .then((data) =>
    data.query.map((e) => {
      const { date, time } = parseTime(e.createdAt);


      if (e.photochat.length > 0 && e.message.length > 0) {
        // kirim foto dan message
        {
          e.user === user
            ? (messages.innerHTML =
                messages.innerHTML +
                `<div class="message" id="chatsaya">
          <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
          <div class="image_message">
               <img src="${e.photochat[0].image_path}" class="fotochat" alt="foto_chat" >
               </div>
  
          <span>${e.message} </span>
          <p class="time_message">${time}</p>

      </div>`)
            : (messages.innerHTML =
                messages.innerHTML +
                `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
        <div class="image_message">
             <img src="${e.photochat[0].image_path}" class="fotochat" alt="foto_chat" >
             </div>
  
        <span>${e.message} </span>
        <p class="time_message">${time}</p>

    </div>`);
        }
        return;
      } else if (e.photochat.length > 0 && e.message.length === 0) {
        // KIRIM FOTO TANPA MESSAGE

        {
          e.user === user
            ? (messages.innerHTML =
                messages.innerHTML +
                `<div class="message" id="chatsaya">
          <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
          <div class="image_message">
               <img src="${e.photochat[0].image_path}" class="fotochat" alt="foto_chat" >
          <p class="time_message">${time}</p>

               </div>
  
      </div>`)
            : (messages.innerHTML =
                messages.innerHTML +
                `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
        <div class="image_message">
             <img src="${e.photochat[0].image_path}" class="fotochat" alt="foto_chat" >
          <p class="time_message">${time}</p>

             </div>
  
    </div>`);
        }
        return;
      } else if (e.photochat.length === 0 && e.message.length > 0) {
        // KIRIM MESSAGE TANPA FOTO
        const date = new Date(e.createdAt);
        const time = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        {
          e.user === user
            ? (messages.innerHTML =
                messages.innerHTML +
                `<div class="message" id="chatsaya">
          <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
          <span>${e.message}</span>
          <p class="time_message">${time}</p>
  
      </div>`)
            : (messages.innerHTML =
                messages.innerHTML +
                `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${e.user === user ? "me" : e.user}</span> </b>
        <span>${e.message} </span>
        <p class="time_message">${time}</p>
  
    </div>`);
        }
        return;
      }
    })
  )
  .catch((error) => console.error(error));
