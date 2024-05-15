const redisClient = require('./redis');
const dbClient = require('./db');

/**
 * Authenticates a user based on the provided request object.
 * @param {Object} req - The request object containing the headers.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean
 *      indicating whether the user is authenticated or not.
 */
async function authUser(req) {
  const { 'x-token': token } = req.headers;

  if (!token) return false;

  try {
    const sessionToken = await redisClient.get(`auth_${token}`);
    if (sessionToken) {
      const user = await dbClient.getUserById(sessionToken);
      return user;
    }
    return false;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return false;
  }
}

/**
 * Represents a file object.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} name - The name of the file.
 * @param {string} type - The type of the file.
 * @param {boolean} isPublic - Indicates if the file is public or not.
 * @param {string} [parentId='0'] - The ID of the parent file.
 * @param {string} [localPath=''] - The local path of the file.
 */
function FileObj(userId, name, type, isPublic, parentId = '0', localPath = '') {
  this.userId = userId._id;
  this.name = name;
  this.type = type;
  this.isPublic = isPublic;
  this.parentId = parentId;
  this.localPath = localPath;
}

module.exports = {
  authUser,
  FileObj,
};
