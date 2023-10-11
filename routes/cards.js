const express = require('express');

const router = express.Router();

const {
  getCards,
  createCard,
  deleteCardId,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

// Роутер для получения всех карточек
router.get('/', getCards);
// Роутер для создания карточки
router.post('/', createCard);
// Роутер для удаления карточки по идентификатору
router.delete('/:cardId', deleteCardId);
// Роутер для лайка карточке
router.put('/:cardId/likes', likeCard);
// Роутер удаления карточки по идентификатору
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
