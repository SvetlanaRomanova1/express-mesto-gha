const mongoose = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ServerError = require('../errors/server-error');
const Forbidden = require('../errors/forbidden-error');

// Контроллер для получения всех карточек
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};
// Контроллер для создания карточки
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user && req.user._id;

  if (typeof name === 'string' && name.length <= 1) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  if ((req.body.name && req.body.name.length >= 30) || !req.body.name || !req.body.link) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  return Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch(next);
};

// Контроллер для удаления карточки по идентификатору
module.exports.deleteCardId = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Некорректный формат _id карточки');
  }

  return Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка с _id ${req.params.cardId} не найдена`);
      }
      if (card.owner === userId) {
        return res.send({ data: card });
      }
      // Запрещено удалять
      throw new Forbidden('Вы не можете удалить эту картинку');
    })
    .catch(next);
};

// Контроллер для добавления лайка к карточке
module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Некорректный формат _id карточки');
  }

  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        throw new NotFoundError('Карточка не найдена');
      }
      return res.status(200).send({ data: updatedCard });
    })
    .catch(next);
};

// Контроллер для удаления лайка к карточке
module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Некорректный формат _id карточки');
  }

  return Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((updatedCard) => {
      if (!updatedCard) {
        throw new NotFoundError('Карточка не найдена');
      }

      return res.status(200).send({ data: updatedCard });
    })
    .catch(next);
};
