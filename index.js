const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
// const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 9000;

app.get("/", function (req, res) {
    res.sendFile( __dirname + "/index.html");
});

let online_users = 0;

io.on("connection", socket => {
    online_users++;
    socket.username = socket.id;
    socket.broadcast.emit("user_joined", {username: socket.username});

    socket.on("username", (username)=> {
        socket.username = username;
        socket.broadcast.emit("username_changed", {username: socket.username});
    });

    socket.on("typing", (username)=> {
        socket.emit("typing", username);
    });

    socket.on("disconnect", ()=> {
        let user_id = (socket.username != undefined ? socket.username : socket.id);
        socket.broadcast.emit("user_left", {username: user_id });
        online_users--;
    });

    socket.on("message", (message)=> {
        let data = { message: message, username: socket.username, user_id: socket.id };
        socket.broadcast.emit("message", data);
        socket.emit("message", data);
    });
});

// PORT IMPLEMENTATION
http.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});