const mongoose = require('mongoose');
require('dotenv').config();

const MongoURL = process.env.MONGODB_CONNECTION_STRING;
const connectToMongo = () => {
    mongoose.connect(MongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to Mongo Successfully');
        })
        .catch((err) => {
            console.error('Failed to connect to Mongo:', err);
        });
};

module.exports = connectToMongo;