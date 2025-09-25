// 'use strict';
// const multer = require('multer');
// const AWS = require('aws-sdk');
// const multerS3 = require('multer-s3');

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.AWS_BUCKET,
//     acl: 'public-read',
//     key: (req, file, cb) => {
//       const ext = file.originalname.split('.').pop();
//       const base = file.originalname.replace(/\.[^/.]+$/, "");
//       cb(null, `uploads/${base}-${Date.now()}.${ext}`);
//     },
//   }),
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Only image uploads allowed'), false);
//     }
//     cb(null, true);
//   },
// });

// module.exports = {
//   upload,
//   getFileUrl: (file) => file.location,
// };
