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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Use the routes index file
app.use('/api', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

sequelize.sync({
    alter: true
}).then(() => {
    app.listen(PORT, () => {
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
