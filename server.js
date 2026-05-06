require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const errorHandler = require('./middleware/errorHandler');;
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const statesRouter = require('./routes/states');
const PORT = process.env.PORT || 3500;

//Conect to mongodb
connectDB();

// middleware for CORS
app.use(cors(corsOptions));

//middleware for handling json data
app.use(express.json());

app.use('/', express.static(path.join(__dirname, '/views')))

//use routes
app.use('/states', statesRouter);

//404 catch-all
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).type('txt').send('404 Not Found');
  }
});

//middleware for handling errors
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
