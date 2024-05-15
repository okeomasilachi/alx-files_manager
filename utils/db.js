const { MongoClient, ObjectId } = require('mongodb');

/**
 * Represents a MongoDB client for interacting with the database.
 */
class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    this.connect();
    this.database = this.client.db();
  }

  /**
   * Connects to the MongoDB database.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */
  async connect() {
    try {
      await this.client.connect();
      // console.log('Connected to MongoDB');
    } catch (error) {
      // console.error('Failed to connect to MongoDB:', error);
    }
  }

  /**
   * Checks if the database connection is alive.
   * @returns {boolean} Returns true if the database connection is alive, otherwise false.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves a user from the database based on the provided query object.
   *
   * @param {Object} queryObject - The query object used to search for the user.
   * @returns {Promise<Object|null>} - A promise that resolves to the user
   *    object if found, or null if not found.
   */
  async getUser(quaryObject) {
    const usersCollection = this.database.collection('users');
    const user = await usersCollection.findOne(quaryObject);
    return user;
  }

  /**
   * Retrieves a user from the database by their ID.
   * @param {string} userId - The ID of the user to retrieve.
   * @returns {Promise<Object>} - A promise that resolves to the user object.
   */
  async getUserById(userId) {
    const id = ObjectId(userId);
    const usersCollection = this.database.collection('users');
    const user = await usersCollection.findOne({ _id: id });
    return user;
  }

  /**
   * Inserts data into the users collection.
   * @param {Object} data - The data to be inserted.
   * @returns {Promise<Object>} - A promise that resolves to the inserted user.
   */
  async insert(data) {
    const usersCollection = this.database.collection('users');
    const user = await usersCollection.insertOne(data);
    return user;
  }

  /**
   * Returns the number of users in the database.
   * @returns {Promise<number>} The number of users.
   */
  async nbUsers() {
    const usersCollection = this.database.collection('users');
    const count = await usersCollection.countDocuments();
    return count;
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<number>} The number of files.
   */
  async nbFiles() {
    const filesCollection = this.database.collection('files');
    const count = await filesCollection.countDocuments();
    return count;
  }

  /**
   * Retrieves a file from the database based on the provided query object.
   *
   * @param {Object} queryObject - The query object used to find the file.
   * @returns {Promise<Object|null>} - A promise that resolves to the file
   *    object if found, or null if not found.
   */
  async getFile(quaryObject) {
    const fileCollection = this.database.collection('files');
    const file = await fileCollection.find(quaryObject).toArray();
    return file;
  }

  /**
   * Retrieves a file from the database by its ID.
   *
   * @param {string} fileId - The ID of the file to retrieve.
   * @returns {Promise<Object>} - A promise that resolves to the file object.
   */
  async getFileById(fileId) {
    const _id = new ObjectId(fileId);
    const fileCollection = this.database.collection('files');
    const file = await fileCollection.findOne({ _id });
    if (file !== 'null') {
      const { localPath, ...fileWithoutPath } = file;
      return fileWithoutPath;
    }
    return file;
  }

  /**
   * Publishes a file by its ID.
   * @param {string} id - The ID of the file to be published.
   * @returns {Object|boolean} - The published file object if successful,
   *    or false if the file was not found.
   */
  async publishFileById(id) {
    const fileCollection = this.database.collection('files');
    const _Id = new ObjectId(id);

    const existingFile = await fileCollection.findOne({ _Id });
    if (existingFile && existingFile.isPublic === true) {
      const { localPath, ...publishedFile } = existingFile;
      return publishedFile;
    }
    const file = await fileCollection.updateOne({ _id: _Id }, { $set: { isPublic: true } });
    if (file.matchedCount === 0) {
      return false;
    }
    const published = await this.getFileById(id);
    const { localPath, ...publishedFileWithoutPath } = published;
    return publishedFileWithoutPath;
  }

  /**
   * Unpublishes a file by its ID.
   * @param {string} id - The ID of the file to unpublish.
   * @returns {Object|boolean} - The unpublished file object if successful,
   *    or false if the file was not found.
   */
  async unPublishFileById(id) {
    const fileCollection = this.database.collection('files');
    const _Id = new ObjectId(id);
    const existingFile = await fileCollection.findOne({ _Id });
    if (existingFile && existingFile.isPublic === false) {
      const { localPath, ...publishedFile } = existingFile;
      return publishedFile;
    }
    const file = await fileCollection.updateOne({ _id: _Id }, { $set: { isPublic: false } });
    if (file.matchedCount === 0) {
      return false;
    }
    const published = await this.getFileById(id);
    const { localPath, ...publishedFileWithoutPath } = published;
    return publishedFileWithoutPath;
  }

  /**
   * Retrieves a page of documents from the 'files' collection.
   *
   * @param {number} pageNumber - The page number to retrieve.
   * @param {number} pageSize - The number of documents per page.
   * @returns {Promise<Array<Object>>} - A promise that resolves to an array of documents.
   */
  async getPage(pageNumber, pageSize, user, parentId) {
    const fileCollection = this.database.collection('files');
    try {
      const parentIdToQuery = parentId || '0';
      const aggregatePipeline = [
        {
          $match: {
            parentId: parentIdToQuery,
            userId: user._id.toString(),
          },
        },
        {
          $skip: pageNumber * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];
      const files = await fileCollection.aggregate(aggregatePipeline).toArray();
      if (files.lenght === 0) {
        return [];
      }
      return files;
    } catch (err) {
      console.error(err);
    }
    return [];
  }

  /**
   * Inserts a file into the database.
   * @param {Object} queryObject - The query object used to find the file.
   * @returns {Promise<Object>} - A promise that resolves to the inserted file.
   */
  async insertFile(quaryObject) {
    const fileCollection = this.database.collection('files');
    const file = await fileCollection.insertOne(quaryObject);
    const {
      userId,
      name,
      type,
      isPublic,
      parentId,
    } = file.ops[0];

    return {
      id: file.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
