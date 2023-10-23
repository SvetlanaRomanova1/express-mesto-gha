const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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

const auth = require('./middlewares/auth');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Использование роутов пользователей
app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

// Обработчики для регистрации и входа (аутентификации)
app.post('/signin', require('./controllers/users').login);
app.post('/signup', require('./controllers/users').createUser);
// Middleware for handling undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// наш централизованный обработчик
app.use((err, req, res) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
