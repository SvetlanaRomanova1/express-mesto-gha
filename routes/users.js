const express = require('express');

const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

// Роутер для получения всех пользователей
router.get('/', getUsers);
// Роутер для получения пользователя по ID
router.get('/:userId', getUserById);
// Роутер для создания пользователя
router.post('/', createUser);
// Роутер для обновления профиля пользователя
router.patch('/me', updateProfile);
// Роутер для обновления аватара пользователя
router.patch('/me/avatar', updateAvatar);

module.exports = router;
