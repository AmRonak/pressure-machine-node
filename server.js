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

// Handle WebSocket connections (for devices and React clients)
wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            // Register the device with a unique ID
            clients[data.deviceId] = ws;
            console.log(`Device registered: ${data.deviceId}`);
            reactClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'new-device-online',
                        deviceId: data.deviceId,
                        response: "Device Online"
                    }));
                }
            });
        } else if (data.type === 'react-register') {
            // Add the React client to the list
            reactClients.push(ws);
            console.log('React app connected');
        } else if (data.type === 'response') {
            // Handle response from device
            const { deviceId, response } = data;
            console.log(`Response from device ${deviceId}: ${response}`);

            // Send response to all React clients
            reactClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'device-response',
                        deviceId: deviceId,
                        response: response
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        
        // Remove WebSocket connections from React clients or devices
        Object.keys(clients).forEach((key) => {
            if (clients[key] === ws) delete clients[key];
        });
        reactClients = reactClients.filter(client => client !== ws);
    });
});

// Handle WebSocket request from React app
app.post('/send-data', (req, res) => {
    const { deviceId, data } = req.body;

    // Send data to a specific device
    if (clients[deviceId]) {
        clients[deviceId].send(JSON.stringify({ type: 'data', payload: data }));
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
