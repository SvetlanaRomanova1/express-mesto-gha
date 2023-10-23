const express = require('express');

const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

// // Middleware для централизованной обработки ошибок
// router.use((err, req, res, next) => {
// // Обработка ошибок здесь
//   console.error(err);
//
//   res.status(500).json({ error: 'Внутренняя ошибка сервера' });
// });

// Роутер для получения всех пользователей
router.get('/', getUsers);
// Роутер для получения пользователя по ID
router.get('/:userId', getUserById);
// Роутер для обновления профиля пользователя
router.patch('/me', updateProfile);
// Роутер для обновления аватара пользователя
router.patch('/me/avatar', updateAvatar);
router.get('/users/me', getCurrentUser);

module.exports = router;
