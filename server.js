const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const User = require('./models/user');
const { createAdmin } = require('./controllers/userController');
const WebSocket = require('ws');
const http = require('http');

const OFFLINE = "OFFLINE";
const LOGGED_IN = "LOGGED_IN";
const ONLINE = "ONLINE";
const TEST_STARTED = "TEST_STARTED";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
console.log(PORT)

const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const wss = new WebSocket.Server({ server });

let clients = {}; // Store connected devices
let reactClients = []; // Store WebSocket connections for React clients

wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            if (data.deviceId) {
                clients[data.deviceId] = {
                    ws: ws,
                    loggedIn: false,
                    testStarted: false,
                    testStopped: false 
                };
                console.log(`Device registered: ${data.deviceId}`);

                notifyReactClients({
                    type: 'new-device-online',
                    deviceInfo: getDeviceInfo(data.deviceId)
                });
            }
        } else if (data.type === 'react-register') {
            
            reactClients.push({...ws, isSuperUser: data.isSuperUser});
            console.log('React app connected');

            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'online-device-list',
                    devices: getAllDeviceInfo()
                }));
            }
        } else if (data.type === 'login-success') {
            const { deviceId } = data;
            if (clients[deviceId]) {
                clients[deviceId].loggedIn = true;
                console.log(`Device ${deviceId} logged in`);
                notifyReactClients({
                    type: 'device-login-success',
                    deviceInfo: getDeviceInfo(deviceId)
                });
            }
        } else if (data.type === 'test-start') {
            const { deviceId } = data;
            if (clients[deviceId]) {
                clients[deviceId].testStarted = true;  
                clients[deviceId].testStopped = false; 
                console.log(`Test started for device ${deviceId}`);
                notifyReactClients({
                    type: 'device-test-start',
                    deviceInfo: getDeviceInfo(deviceId)
                });
            }
        } else if (data.type === 'test-stop') {
            const { deviceId } = data;
            if (clients[deviceId]) {
                clients[deviceId].testStopped = true;
                clients[deviceId].testStarted = false; 
                console.log(`Test stopped for device ${deviceId}`);
                notifyReactClients({
                    type: 'device-test-stop',
                    deviceInfo: getDeviceInfo(deviceId)
                });
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');

        // Remove from clients if it's a device
        Object.keys(clients).forEach((key) => {
            if (clients[key].ws === ws) {
                console.log(`Device disconnected: ${key}`);
                notifyReactClients({
                    type: 'device-offline',
                    deviceId: key,
                    response: "Device Offline"
                });
                delete clients[key];
            }
        });

        // Remove from reactClients if it's a React connection
        reactClients = reactClients.filter(client => client !== ws);
    });
});

function notifyReactClients(message) {
    reactClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function getDeviceInfo(deviceId) {
    const device = clients[deviceId];
    if (device) {
        let status = device.testStarted ? TEST_STARTED : device.loggedIn ? LOGGED_IN : ONLINE
        return {
            deviceId: deviceId,
            status,
            isOnline: true,
            loggedIn: device.loggedIn,
            testStarted: device.testStarted,
            testStopped: device.testStopped
        };
    }
    return null;
}

function getAllDeviceInfo() {
    return Object.keys(clients).map(deviceId => getDeviceInfo(deviceId));
}

app.post('/send-data', (req, res) => {
console.log("reactClients ", reactClients);
    const { deviceId, data, isSuperUser } = req.body;

    // Send data to a specific device
    if (clients[deviceId] && clients[deviceId].ws) {
        clients[deviceId].ws.send(JSON.stringify({ type: 'data', payload: data, isSuperUser  }));
        res.json({ status: 'Data sent' });
    } else {
        res.status(404).json({ error: 'Device not found' });
    }
});

// Use the routes index file
app.use('/api', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

sequelize.sync({
    // alter: true
}).then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);

        User.findOne({
            where: {
                userLevel: "Administrator"
            }
        })
            .then(result => {
                if (!result) {
                    createAdmin()
                        .then(res => {
                            console.log("Admin Created");
                        })
                        .catch(e => {
                            console.log("error", e);
                        })
                }
            })
            .catch(e => {
                console.log("error", e);
            })
    });
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});
