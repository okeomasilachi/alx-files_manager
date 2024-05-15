const Queue = require('bull');
const dbClient = require('./utils/db');
const thumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async job => {
  const { userId, fileId } = job.data;
  
  if (!userId) {
    throw new Error('Missing userId');
  }
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  const file = await dbClient.getFileById(fileId);

  if (!file || file.userId !== userId) {
    throw new Error('File not found');
  }

  if (file.type === 'image') {
    try {
      const options = { width: 500 };
      const thumbnail500 = await thumbnail(file.localPath, options);
      await fs.promises.writeFile(`${file.localPath}_500`, thumbnail500);
      
      options.width = 250;
      const thumbnail250 = await thumbnail(file.localPath, options);
      await fs.promises.writeFile(`${file.localPath}_250`, thumbnail250);
      
      options.width = 100;
      const thumbnail100 = await thumbnail(file.localPath, options);
      await fs.promises.writeFile(`${file.localPath}_100`, thumbnail100);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  }
});

module.exports = { fileQueue };
