const express = require('express');

const router = express.Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

// Роутер для получения всех пользователей
router.get('/', getUsers);
router.get('/me', getCurrentUser);
// Роутер для получения пользователя по ID
router.get(
  '/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24),
    }),
  }),
  getUserById,
);
// Роутер для обновления профиля пользователя
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);
// Роутер для обновления аватара пользователя
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
  }),
}), updateAvatar);

module.exports = router;
