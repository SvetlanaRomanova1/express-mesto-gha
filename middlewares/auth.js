const jwt = require('jsonwebtoken');

const ERROR_CODE_UNAUTHORIZED = 401;
const SECRET_KEY = 'your-secret-key';

const errorResponse = (message) => ({ message });

module.exports = (req, res, next) => {
  // Получите токен из заголовков запроса
  // const { authorization } = req.headers;
  // console.log({ authorization });
  //
  // if (!authorization || !authorization.startWith('Bearer')) {
  //   return res.status(ERROR_CODE_UNAUTHORIZED).send(errorResponse('Необходима авторизация'));
  // }
  //
  // const token = authorization.replace('Bearer', '');
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
