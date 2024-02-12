const { Server } = require('socket.io');

const userSocketIds = {};
const socketIdWithUsers = {};

const configureSocketIO = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected! ` + socket.id);

        socket.on('username', ({ username }) => {
            if (username in userSocketIds) {
                socket.emit('duplicate');
                return;
            }
            userSocketIds[username] = socket.id;
            socketIdWithUsers[socket.id] = username;
        });

        socket.on('disconnect', () => {
            console.log('a user got disconnected ' + socket.id);
            let username = socketIdWithUsers[socket.id];
            let socketId = socket.id;
            delete userSocketIds[username];
            delete socketIdWithUsers[socketId];
            console.log(`cancelling all transfers to/from ` + socketId);
        });

        socket.on('transfer_request', ({deviceId, filesCount}) => {
            if (!(deviceId in socketIdWithUsers)) {
                socket.emit('client_disconnected');
                return;
            }
            let thisDeviceName = socketIdWithUsers[socket.id];
            io.to(deviceId).emit('transfer_request', {deviceId: socket.id, deviceName: thisDeviceName, filesCount})
        });

        socket.on('transfer_response', ({deviceId, accepted}) => {
            console.log(`emitting response to ${deviceId} from ${socket.id}`);
            io.to(deviceId).emit('transfer_response', {accepted});
        });
    });
};

module.exports = {
    configureSocketIO,
    userSocketIds,
    socketIdWithUsers,
};
