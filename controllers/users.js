const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const Conflict = require('../errors/conflict-error');
const ServerError = require('../errors/server-error');
const AuthorisationError = require('../errors/authorisation-error');

// Контроллер для получения всех пользователей
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// Контроллер для получения пользователя по ID
module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.send({ data: user });
    })
    .catch(next);
};

// Контроллер для создания пользователей
module.exports.createUser = (req, res, next) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    email,
    password,
  } = req.body;

  // Хеширование пароля
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      throw new ServerError('Произошла ошибка при хешировании пароля');
    }

    return User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => {
        // Exclude the 'password' field from the user object
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        res.status(201).send({ data: userWithoutPassword });
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          next(new BadRequestError('Введены некорректные данные'));
        } else if (error.code === 11000) {
          next(new Conflict('Такой пользователь уже существует!)'));
        } else {
          next(error);
        }
      });
  });
};

// Контроллер для аутентификации пользователя и выдачи JWT-токена

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const SECRET_KEY = 'your-secret-key';
  const TOKEN_EXPIRATION = '7d';

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AuthorisationError('Аутентификация не удалась. Пользователь не найден.');
    }

    const result = await bcrypt.compare(password, user.password);

    if (result) {
      // Если пароль верный, создаем и отправляем JWT
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
      res.cookie('jwt', token, { httpOnly: true });
      res.status(200).send({ message: 'Аутентификация успешна.' });
    }
    throw new AuthorisationError('Аутентификация не удалась. Неверный пароль.');
  } catch (error) {
    next(error);
  }
};

// Контроллер для обновления профиля пользователя
// eslint-disable-next-line consistent-return
module.exports.updateProfile = (req, res, next) => {
  const userId = req.user._id;

  const allowedFields = ['name', 'about'];

  if (!allowedFields.every(((item) => req.body[item]))) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  if (req.body.name && req.body.name.length >= 30) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  const updatedFields = {};

  allowedFields.forEach((field) => {
    if (req.body[field]) {
      updatedFields[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new NotFoundError('Нет пользователя с таким id');
  }

  User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: updatedUser });
    })
    .catch(next);
};

// Контроллер для получения информации о текущем пользователе
module.exports.getCurrentUser = (req, res) => {
  const currentUser = req.user;

  // Возвращаем информацию о текущем пользователе
  return res.json(currentUser);
};

// Контроллер для обновления аватар
// eslint-disable-next-line consistent-return
module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;

  const allowedFields = ['avatar'];

  const updatedFields = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      updatedFields[field] = req.body[field];
    }
  });

  if (Object.keys(updatedFields).length === 0) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true })
    .then((updatedUser) => {
      res.status(200).send({ data: updatedUser });
    })
    .catch(next);
};
