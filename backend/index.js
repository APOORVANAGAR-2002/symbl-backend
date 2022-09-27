const express = require('express');
const mongoose = require('mongoose');
app = express();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const bodyParser = require('body-parser');
const Grid = require('gridfs-stream');
const { MongoClient } = require("mongodb");

const mongoUri = "mongodb://nagar245:DbG0WrRA7gfDKUYp@ac-5svmps7-shard-00-00.cc9eirb.mongodb.net:27017,ac-5svmps7-shard-00-01.cc9eirb.mongodb.net:27017,ac-5svmps7-shard-00-02.cc9eirb.mongodb.net:27017/?ssl=true&replicaSet=atlas-uirepy-shard-0&authSource=admin&retryWrites=true&w=majority";



// Creating bucket
let bucket;
mongoose.connection.once("open", () => {
  console.log('Connected to MongoDb');
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'uploads'
  });
  console.log(bucket);
})

//Following lines make sure that our app can parse the json data in our api calls
// app.use(express.json({ limit: '25mb' })); // to parse json content
// app.use(express.static('uploads'));

app.use(bodyParser.json());
app.use(express.urlencoded({
  extended: false
}));

// create mongo connection
const conn = mongoose.createConnection(mongoUri);

// creating collection
let gfs, gridfsBucket;
conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});


const storage = new GridFsStorage({
  url: mongoUri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({
  storage
});

const client = new MongoClient(mongoUri);
const dbName = "test";

client.connect();
console.log("Connected to the Mongo");
const db = client.db(dbName);

const col = db.collection('uploads.files');


// @post: 
app.post("/upload", upload.single("file"), (req, res) => {
  // res.status(200)
  //   .send("File uploaded successfully");
  res.json({ file: req.file });
});
  

// @get: /files: to get all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // check if files exist
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      })
    }
    // Files exist
    return res.json(files);
  })
})

// @get:specific file
app.get("/fileinfo/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    return res.json(file);
  });
})

// @get:specific video
// app.get("/video/:filename", (req, res) => {
  // gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
  //   // Check if file
  //   if (!file || file.length === 0) {
  //     return res.status(404).json({
  //       err: 'No files exist'
  //     });
  //   }
  //   // return res.json(file);
  //   // Check if video
  //   if (file.contentType === 'video/mp4') {
  //     // Read output
  //     const readstream = gridfsBucket.openDownloadStream(file._id);
  //     readstream.pipe(res);
  //   } else {
  //     res.status(404).json({
  //       err: 'Not an image'
  //     });
  //   }
  // });
// })


  // console.log(buck
  // const file = bucket
  //   .find({
  //     filename: req.params.filename
  //   })
  //   .toArray((err, files) => {
  //     if (!files || files.length === 0) {
  //       return res.status(404)
  //         .json({
  //           err: "no files exist"
  //         });
  //     }
  //     bucket.openDownloadStreamByName(req.params.filename)
  //       .pipe(res);
  //   });


const PORT = 8080;
app.listen(PORT, () => {
  console.log('Server running on PORT: 8080');
})

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const app = express();

// const PORT = 5000;
// var corsOptions = {
//     origin: 'http://localhost:4200'
// };
// const mongoose = require('mongoose');
// // const { mongoose } = require('./db/mongoose');
// // initialize gridfs storage engine
// const methodOverride = require('method-override');
// const multer = require('multer');
// const gridFsStorage = require('multer-gridfs-storage');
// const { Grid } = require('gridfs-stream');
// const { GridFsStorage } = require('multer-gridfs-storage/lib/gridfs');
// const req = require('express/lib/request');
// const { path } = require('express/lib/application');


// // Middleware
// // app.use(bodyParser.json());
// app.use(express.json());
// app.use(cors());
// // app.use(function (req, res, next) {
// //     res.header("Access-Control-Allow-Origin", "*");
// //     res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
// //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// //     next();
// // });

// // Mongo URI
// const mongoURI = 'mongodb+srv://nagar245:Kitty_1307#*@cluster0.kgtqne3.mongodb.net/?retryWrites=true&w=majority';

// // Create MongoConnection
// const promise = mongoose.connect(mongoURI, {useUnifiedTopology: true, useNewUrlParser: true });
// // const conn = mongoose.connection;

// // Creating bucket
// let bucket;
// mongoose.connection.on('connected', () => {
//   var client = mongoose.connections[0].client;
//   var db = mongoose.connections[0].db;
//   bucket = new mongoose.mongo.GridFSBucket(db, {
//     bucketName: 'uploads'
//   });
//   console.log(bucket);
// });


// // Initilaize gfs
// // let gfs;
// //   when the database connection opens we want to set the gfs variable to Grid
// // conn.once('open', () => {
// //     gfs = Grid(conn, mongoose.mongo);
// //     gfs.collection('uploads');
// // });


// // Create storage engine
// const storage = new GridFsStorage({
//     url: mongoURI,
//     file: (req, file) => {
//       return new Promise((resolve, reject) => {
//         const filename = file.originalname;
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads'
//         };
//         resolve(fileInfo);
//         // crypto.randomBytes(16, (err, buf) => {
//         //   if (err) {
//         //     return reject(err);
//         //   }
//         //   const filename = buf.toString('hex') + path.extname(file.originalname);
//         //   const fileInfo = {
//         //     filename: filename,
//         //     bucketName: bucketName
//         //   };
//         //   resolve(fileInfo);
//         // });
//       });
//     }
//   });
// // const storage = (conn, 'uploads') => new GridFsStorage({
// //     // db: promise,
// //     url: url,
// //     file: (req, file) => {
// //         return new Promise((resolve, reject) => {
// //             crypto.randomBytes(16, (err, buff) => {
// //                 if (err) {
// //                     return reject(err);
// //                 }
// //                 const filename = buff.toString('hex') + path.extname(file.originalname);
// //                 const fileInfo = {
// //                     filename: filename,
// //                     bucketName: 'uploads'
// //                 };
// //                 resolve(fileInfo);
// //             });
// //         });
// //     }
// // });
// const upload = multer({ storage });

// // API calls
// // @route: POST /upload
// // @desc: Uploads file to DB
// // since we are only uploading a single file, with multer we can upload multiple files at a time.
// //  It can have array of mulitple files. Thus, we are saying to use only single file
// app.post('/upload', upload.single('file'), (req, res) => {
//     // upload(req, res, (err) => {
//     //     if (err) {
//     //         console.log(err);
//     //     }
//     //     console.log(req.file.path);
//     // })
//     console.log(req.body);
//     console.log(res.body);
//   res.json({ file: req.file });
//   res.status(200).send('File uploaded successfully');
// })

// app.listen(PORT, () => {
//     console.log(`Server running on PORT: ${PORT}`);
// })