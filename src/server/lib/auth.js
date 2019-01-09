import env from '../env';
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Helper
const daysToSeconds = days => moment.duration({ days }).asSeconds();

/* Constants that determin token expiration */
export const TOKEN_EXPIRATION_LOGIN = daysToSeconds(1);
export const TOKEN_EXPIRATION_CONNECTED_ACCOUNT = daysToSeconds(1);
export const TOKEN_EXPIRATION_SESSION = daysToSeconds(90);

/** Generate a JWToken with the received parameters */
export function createJwt(subject, payload, expiresIn) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
    subject,
  });
}

/** Verify JWToken */
export function verifyJwt(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
