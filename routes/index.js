/**
 * Express router for handling routes.
 * @module routes/index
 */

const express = require('express');

const router = express.Router();

const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

/**
 * Route for getting the status of the application.
 * @name GET /status
 * @function
 */
router.get('/status', AppController.getStatus);

/**
 * Route for getting the statistics of the application.
 * @name GET /stats
 * @function
 */
router.get('/stats', AppController.getStats);

/**
 * Route for creating a new user.
 * @name POST /users
 * @function
 */
router.post('/users', UsersController.postNew);

/**
 * Route for connecting to a user.
 * @name GET /connect
 * @function
 */
router.get('/connect', AuthController.getConnect);

/**
 * Route for disconnecting from a user.
 * @name GET /disconnect
 * @function
 */
router.get('/disconnect', AuthController.getDisconnect);

/**
 * Route for getting the current user.
 * @name GET /users/me
 * @function
 */
router.get('/users/me', UsersController.getMe);

/**
 * Route for uploading files.
 * @name POST /files
 * @function
 */
router.post('/files', FilesController.postUpload);

/**
 * Route for getting a specific file by ID.
 * @name GET /files/:id
 * @function
 */
router.get('/files/:id', FilesController.getShow);

/**
 * Route for getting all files.
 * @name GET /files
 * @function
 */
router.get('/files', FilesController.getIndex);

/**
 * Route for unpublishing a file.
 * @name PUT /files/:id/unpublish
 * @function
 */
router.put('/files/:id/unpublish', FilesController.putUnpublish);

/**
 * Route for publishing a file.
 * @name PUT /files/:id/publish
 * @function
 */
router.put('/files/:id/publish', FilesController.putPublish);

/**
 * Route to accept a query parameter size
 * @name GET/ files/ :id/data
 * @function
 */
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;
