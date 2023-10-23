const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
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
  Card.findById(cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена');
    })
    .then((card) => {
      const owner = card.owner.toString();
      if (userId === owner) {
        Card.deleteOne(card)
          .then(() => {
            res.send(card);
          })
          .catch(next);
      } else {
        throw new Forbidden('Невозможно удалить карточку');
      }
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные удаления'));
      } else {
        next(e);
      }
    });
};

// Контроллер для добавления лайка к карточке
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Передан несуществующий _id карточки');
    })
    .then((card) => {
      res.send(card);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(e);
      }
    });
};

// Контроллер для удаления лайка к карточке
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Передан несуществующий _id карточки');
    })
    .then((card) => {
      res.send(card);
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(e);
      }
    });
};
