const jwt = require('jsonwebtoken');

const ERROR_CODE_UNAUTHORIZED = 401;
const SECRET_KEY = 'your-secret-key';

const errorResponse = (message) => ({ message });

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(ERROR_CODE_UNAUTHORIZED).send(errorResponse('Необходима авторизация'));
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);

    req.user = payload;

    return next();
  } catch (err) {
    return res.status(ERROR_CODE_UNAUTHORIZED).send(errorResponse('Необходима авторизация'));
  }
};
