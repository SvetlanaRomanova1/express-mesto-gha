const User = require('../models/user');
//  Коды ошибок
const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_DEFAULT = 500;

const errorResponse = (message) => ({ message });

// Контроллер для получения всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(ERROR_CODE_DEFAULT).send({ message: 'Произошла ошибка' }));
};

// Контроллер для получения пользователя по ID
module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send(errorResponse('Пользователь по указанному _id не найден'));
      }
      return res.send({ data: user });
    })
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка')));
};

// Контроллер для создания пользователей
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send({ data: user });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send(errorResponse('Переданы некорректные данные'));
      }
      return res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка'));
    });
};

// Контроллер для обновления профиля пользователя
// eslint-disable-next-line consistent-return
module.exports.updateProfile = (req, res) => {
  const userId = req.user._id;

  const allowedFields = ['name', 'about'];

  const updatedFields = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      updatedFields[field] = req.body[field];
    }
  });

  if (Object.keys(updatedFields).length === 0) {
    return res.status(ERROR_CODE_BAD_REQUEST).send(errorResponse('Переданы некорректные данные'));
  }

  User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(ERROR_CODE_NOT_FOUND).send(errorResponse('Пользователь не найден'));
      }
      return res.status(200).send({ data: updatedUser });
    })
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка')));
};

// Контроллер для обновления аватар
// eslint-disable-next-line consistent-return
module.exports.updateAvatar = (req, res) => {
  const userId = req.user._id;

  const allowedFields = ['avatar'];

  const updatedFields = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      updatedFields[field] = req.body[field];
    }
  });

  if (Object.keys(updatedFields).length === 0) {
    return res.status(ERROR_CODE_BAD_REQUEST).send(errorResponse('Переданы некорректные данные'));
  }

  User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true })
    .then((updatedUser) => {
      res.status(200).send({ data: updatedUser });
    })
    .catch(() => {
      res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка'));
    });
};
