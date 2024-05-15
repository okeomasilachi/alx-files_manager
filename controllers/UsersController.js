import sha1 from 'sha1';

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

/**
 * Handles the creation of a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function postNew(req, res, next) {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    next();
  } else if (!password) {
    res.status(400).json({ error: 'Missing password' });
    res.end();
    next();
  } else {
    const isUser = await dbClient.getUser({ email });

    if (isUser) {
      res.status(400).json({ error: 'Already exist' });
      res.end();
      next();
    } else {
      const data = {
        email,
        password: sha1(password),
      };

      try {
        dbClient.insert(data)
          .then((user) => {
            res.status(201).json({ id: user.insertedId, email }).end();
            next();
          });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
        res.end();
        next();
      }
    }
  }
}

/**
 * Retrieves the user information for the authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function getMe(req, res) {
  const token = req.headers['x-token'];
  if (token) {
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      dbClient.getUserById(userId)
        .then((user) => {
          const { _id, email } = user;
          res.status(200).json({ _id, email });
        })
        .catch(() => {
          res.status(401).json({ error: 'Unauthorized' });
        });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = {
  postNew,
  getMe,
};
