const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * A class representing a file manager.
 */
class FileManager {
  /**
   * Create a file manager.
   */
  constructor() {
    /**
     * The path where files will be saved.
     * @type {string}
     */
    this.savePath = '/tmp/files_manager' || process.env.FOLDER_PATH;

    /**
     * The main path where files will be stored.
     * @type {string}
     */
    this.mainPath = path.resolve(__dirname, this.savePath);
    // console.log(this.mainPath);
    if (!fs.existsSync(this.mainPath)) {
      fs.mkdirSync(this.mainPath, { recursive: true });
    }
  }

  /**
   * Create a new file with the given content.
   * @param {string} originalFileName - The original name of the file.
   * @param {string} content - The content of the file.
   * @returns {string} - The path of the created file.
   */
  createFile(content, parentPath) {
    // const ext = path.extname(originalFileName);
    // const newFileName = `${uuidv4()}${ext}`;
    if (parentPath) {
      const newFileName = `${uuidv4()}`;
      const filePath = path.join(parentPath, newFileName);
      try {
        fs.writeFileSync(filePath, Buffer.from(content, 'base64').toString('utf-8'));
        return filePath;
      } catch (error) {
        throw new Error(`Failed to create file: ${error.message}`);
      }
    } else {
      const newFileName = `${uuidv4()}`;
      const filePath = path.join(this.mainPath, newFileName);
      try {
        fs.writeFileSync(filePath, Buffer.from(content, 'base64').toString('utf-8'));
        return filePath;
      } catch (error) {
        throw new Error(`Failed to create file: ${error.message}`);
      }
    }
  }

  /**
   * Reads the content of a file.
   *
   * @param {string} pathToFile - The path to the file.
   * @returns {string} The content of the file.
   * @throws {Error} If the file does not exist.
   */
  readFile(pathToFile) {
    this.nonExistent = false;
    if (fs.existsSync(pathToFile)) {
      return fs.readFileSync(pathToFile, 'utf8');
    }
    throw new Error('File not found.');
  }

  /**
   * Update the content of a file.
   * @param {string} fileName - The name of the file to update.
   * @param {string} newContent - The new content of the file.
   * @throws {Error} - If the file is not found.
   */
  updateFile(fileName, newContent) {
    const filePath = path.join(this.mainPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, newContent);
    } else {
      throw new Error(`File ${fileName} not found.`);
    }
  }

  /**
   * Delete a file.
   * @param {string} fileName - The name of the file to delete.
   * @throws {Error} - If the file is not found.
   */
  deleteFile(fileName) {
    const filePath = path.join(this.mainPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      throw new Error(`File ${fileName} not found.`);
    }
  }

  /**
   * Create a new directory.
   * @param {string} dirName - The name of the directory to create.
   * @returns {string} - The path of the created directory.
   */
  createDirectory(dirName, parentPath) {
    if (parentPath) {
      const dirPath = path.join(parentPath, dirName);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      return dirPath;
    }
    const dirPath = path.join(this.mainPath, dirName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    return dirPath;
  }

  /**
   * List the contents of the main directory.
   * @returns {string[]} - An array of file and directory names.
   */
  listContents() {
    return fs.readdirSync(this.mainPath);
  }

  /**
   * Change the permissions of a file.
   * @param {string} fileName - The name of the file to change permissions.
   * @param {number} mode - The new permissions mode.
   * @throws {Error} - If the file is not found.
   */
  changeFilePermissions(fileName, mode) {
    const filePath = path.join(this.mainPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.chmodSync(filePath, mode);
    } else {
      throw new Error(`File ${fileName} not found.`);
    }
  }
}

module.exports = FileManager;
