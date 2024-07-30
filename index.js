// const connectToMongo = require('./db');
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
// connectToMongo();


const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3001


app.use(express.json())
// Routes
app.use('/api/clearance',require('./routes/clearance'))
app.use('/api/propane',require('./routes/propane'))
app.use('/api/sprinkler',require('./routes/sprinkler'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})