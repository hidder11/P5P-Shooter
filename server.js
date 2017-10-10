const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
const THREE = require('Three');
var clients = [];

app.listen(3000);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function(socket) {
    socket.emit('log', 'connected');
    let client = new Client(clients.length);
    clients.push(client);
    socket.emit('info', client);
    io.sockets.emit('log', clients);

    socket.on('disconnect', function(socket) {
        clients.splice(clients.indexOf(client), 1);
        // io.sockets.emit("log",client.id);
    });

    socket.on('playerData', function(data) {
        clients[clients.indexOf(client)].position = data.camera;
    });
});

class Client {
    constructor(id) {
        this.id = id;
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
    }
}