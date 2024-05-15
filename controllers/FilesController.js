import dbClient from '../utils/db';
import tools from '../utils/tools';

const mime = require('mime-types');
const FileManager = require('../utils/fileManager');

const fs = new FileManager();
const validTypes = ['folder', 'file', 'image'];

/**
 * Handles the upload of files and folders.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
async function postUpload(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' }).end();
  }
  const {
    name,
    type,
    data,
    parentId = 0,
    isPublic = false,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' }).end();
  }

  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: 'Missing or invalid type' }).end();
  }

  if (type !== 'folder' && !data) {
    return res.status(400).json({ error: 'Missing data' }).end();
  }

  if (parentId !== 0) {
    try {
      const file = await dbClient.getFileById(parentId);
      if (file.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' }).end();
      }
      if (type === 'folder') {
        try {
          const dPath = fs.createDirectory(name, file.localPath);
          const fileData = {
            userId: user._id.toString(),
            name,
            type,
            isPublic,
            parentId,
            localPath: dPath,
          };
          const data = await dbClient.insertFile(fileData);
          return res.status(201).json(data).end();
        } catch (error) {
          console.error(error);
        }
      } else {
        const filePath = fs.createFile(data, file.localPath);
        const fileData = {
          userId: user._id.toString(),
          name,
          type,
          isPublic,
          parentId,
          localPath: filePath,
        };
        const ret = await dbClient.insertFile(fileData);
        return res.status(201).json(ret).end();
      }
    } catch (error) {
      return res.status(400).json({ error: 'Parent not found' }).end();
    }
  }
  if (type === 'folder') {
    try {
      const dPath = fs.createDirectory(name);
      const fileData = {
        userId: user._id.toString(),
        name,
        type,
        isPublic,
        parentId,
        localPath: dPath,
      };
      const data = await dbClient.insertFile(fileData);
      return res.status(201).json(data).end();
    } catch (error) {
      console.error(error);
    }
  } else {
    const filePath = fs.createFile(data);
    const fileData = {
      userId: user._id.toString(),
      name,
      type,
      isPublic,
      parentId,
      localPath: filePath,
    };
    const ret = await dbClient.insertFile(fileData);
    return res.status(201).json(ret).end();
  }
  return res.status(401).json({ error: 'Unauthorized' }).end();
}

/**
 * Retrieves a file by its ID and sends it as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
async function getShow(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' }).end();
  }
  const { id } = req.params;
  const file = await dbClient.getFileById(id);
  if (file === 'null') {
    return res.status(404).json({ error: 'Not found' }).end();
  }
  return res.status(200).json(file).end();
}

/**
 * Retrieves a page of files for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function getIndex(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' }).end();
  }

  const { parentId, page } = req.body;
  const pageNumber = parseInt(page, Number) || 0;
  const pageSize = 20;
  const data = await dbClient.getPage(pageNumber, pageSize, user, parentId);
  return res.status(200).json(data).end();
}

/**
 * Updates the publish status of a file by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
async function putPublish(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' }).end();
  }
  const { id } = req.params;
  const file = await dbClient.publishFileById(id);
  if (!file) {
    return res.status(404).json({ error: 'Not found' }).end();
  }
  return res.status(200).json(file).end();
}

/**
 * Unpublishes a file by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the file is unpublished.
 */
async function putUnpublish(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' }).end();
  }
  const { id } = req.params;
  const file = await dbClient.unPublishFileById(id);
  if (!file) {
    return res.status(404).json({ error: 'Not found' }).end();
  }
  return res.status(200).json(file).end();
}

async function getFile(req, res) {
  const user = await tools.authUser(req);
  if (!user) {
    return res.status(404).json({ error: 'Not found' }).end();
  }

  const { id } = req.params;
  const file = await dbClient.getFileById(id);
  if (file === 'null' || file.isPublic === false) {
    return res.status(404).json({ error: 'Not found' }).end();
  }
  if (file.type === 'folder') {
    return res.status(400).json({ error: 'A folder doesn\'t have content' }).end();
  }
  const mimeType = mime.lookup(file.name);
  const data = fs.readFile(file.localPath);
  return res.writeHead(200, { 'Content-Type': mimeType }).end(data);
}

module.exports = {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnpublish,
  getFile,
};
