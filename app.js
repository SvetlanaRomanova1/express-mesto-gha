const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Подключение к MongoDB
const mongoURI = 'mongodb://localhost:27017/mestodb';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Обработка ошибок подключения к базе данных
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Мидлвэр
app.use((req, res, next) => {
  req.user = {
    _id: '6523e8d417b0ff77f0676355',
  };
  next();
});

// Использование роутов пользователей
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// Middleware for handling undefined routes
app.use((req, res, next) => {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
