const mongoose = require('mongoose');
const Card = require('../models/card');

//  Коды ошибок
const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_DEFAULT = 500;
// Сообщение об ошибке
const errorResponse = (message) => ({ message });
// Контроллер для получения всех карточек
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка')));
};
// Контроллер для создания карточки
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user && req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка')));
};

// Контроллер для удаления карточки по идентификатору
module.exports.deleteCardId = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        return res.status(ERROR_CODE_NOT_FOUND).send(errorResponse(`Карточка с _id ${req.params.cardId} не найдена`));
      }
      res.send({ data: card });
    })
    .catch(() => res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка')));
};

// Контроллер для добавления лайка к карточке
// eslint-disable-next-line consistent-return
module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ERROR_CODE_BAD_REQUEST).send(errorResponse('Некорректный формат _id карточки'));
  }

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        return res.status(ERROR_CODE_NOT_FOUND).send(errorResponse('Карточка не найдена'));
      }
      res.status(200).send({ data: updatedCard });
    })
    .catch(() => {
      res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка'));
    });
};
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        return res.status(ERROR_CODE_NOT_FOUND).send(errorResponse('Карточка не найдена'));
      }
      res.status(200).send({ data: updatedCard });
    })
    .catch(() => {
      res.status(ERROR_CODE_DEFAULT).send(errorResponse('Произошла ошибка'));
    });
};