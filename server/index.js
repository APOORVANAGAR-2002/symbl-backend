const express = require('express');
const app = express();
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const cors = require('cors');
const sdk = require('api')('@symblai/v1.0#148hjgl80ilhyt');

// const formidable = require('formidable');
// const { decode } = require('base64-arraybuffer');
// const fs = require('fs');
// const sdk = require('api')('@symblai/v1.0#148hjgl80ilhyt');
// var http = require('http');

// Supabase project configurations
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcXFrb2Vua3Fxd2x6dnZ5YmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMyNDQ0MDgsImV4cCI6MTk3ODgyMDQwOH0.oXoDke4KpFgnq7NBs5chsqTJkkH4CFRU-RKmrBApQjU';
const baseUrl = 'https://jkqqkoenkqqwlzvvybgd.supabase.co';

const apiId = '6676375767564b36576f4a4f424f6c313959736a6b4370334135624a65366657';
const apiSecret = '48324e6a613136464634326e4a4f466e3037485a6153377a5a5268693772456b48323273635f56666458566331654f626c36556c6d46516e326b574d43597345';

const upload = multer({
    storage: multer.memoryStorage()
})
app.use(express.json({ limit: '50mb' }))
app.use(cors());

const supabase = createClient(baseUrl, API_KEY);


app.post("/signup", async (req, res) => {
    console.log(req.body);
    const { user, session, error } = await supabase.auth.signUp({
        email: req.body.email,
        password: req.body.password
    }, {
        data: {
            first_name: req.body.firstName,
            last_name: req.body.lastName
        }
    })

    res.json({ user, session, error });
})

const symblAuthToken = '';
app.post("/login", async (req, res) => {
    console.log(req.body);
    const { user, session, error } = await supabase.auth.signIn({
        email: req.body.email,
        password: req.body.password
    })
    sdk.generateToken({
        type: 'application',
        appId: apiId,
        appSecret: apiSecret
    }, { generate: ':generate' })
        .then(symbl => {
            console.log(symbl);
            // symblAuthToken = symbl.accessToken;
            // console.log(symblAuthToken);
            res.json({ user, session, error, symbl });
        })
        .catch(err => console.error(err));
})

app.get('/getUser', (req, res) => {
    const user = supabase.auth.user();
    res.json({user});
})

app.get('/onAuthStateChange', (req, res) => {
    supabase.auth.onAuthStateChange((event, session) => {
        res.json({ event, session });
    })
})

app.get('/signout', async (req, res) => {
    const { error } = await supabase.auth.signOut();
    // if (!error) {
    //     res.send('Signed out!');
    //     return;
    // } else {
    //     res.send(error);
    // }
    res.json({ error });
})


// app.get("/getToken", (req, resp) => {
//     sdk.generateToken({
//         type: 'application',
//         appId: apiId,
//         appSecret: apiSecret
//     }, { generate: ':generate' })
//         .then(response => {
//             resp.send(response);
//         })
//         .catch(err => resp.send(err));
// })



// app.post("/upload", (req, res, next) => {
//     const form = new formidable.IncomingForm();

//     form.parse(req, async (err, fields, files) => {
//         if (err) {
//             next(err);
//             return;
//         }
//         const videoFile = files.file;
//         const filename = 'video/' + files.file.originalFilename;

//         // console.log(videoFile, filename);
//         const { data, error } = await supabase.storage.from("uploads").upload(filename, videoFile, {
//             contentType: "video/mp4",
//             cacheControl: '3600',
//             upsert: 'false'
//         })

//         res.json({ files, fields });
//     });
// });

// var options = {
//     host: ''
// }
// app.post("/submitVideo", (req, res) => {
//     sdk.auth('576567ggdgdgd65777tgt76t8gg76tg7');
//     sdk.submitVideoUrl()
//         .then(res => console.log(res))
//         .catch(err => console.error(err));
// })

// @POST: /upload
// desc: uploads the video file to the database
app.post("/fileupload", upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No files found');
    }
    const file = req.file;
    console.log(file);
    supabase.storage
        .from('uploads')
        .upload('video/' + file.originalname, file.buffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: "video/mp4",
        }).then(async (response) => {
            const { data, error } = await supabase.from('file_meta').insert([{
                file_name: file.originalname,
                file_type: file.mimetype
            }])
            res.json({ data, error });
            // console.log(response);
            // res.json({ file });
            // supabase.from('files').insert([{ original_name: file.originalname, type: file.mimetype }]).then((response) => {
            //     console.log('table updated successfully');
            //     res.send('Updated in table');
            // })

            //     res.json({ publicURL, error });

            // });
        });
});

app.get("/getFile/:filename", async (req, res) => {
    console.log("Backend:", req.params.filename);
    const { publicURL, error } = supabase.storage
        .from('uploads')
        .getPublicUrl('video/' + req.params.filename)
    if (publicURL) {
        let filename = req.params.filename;
        const { data, err } = await supabase
            .from('file_meta')
            .update({ public_url: publicURL })
            .eq('file_name', filename)
        res.json({ data, err });
    } else {
        res.send(error);
    }
});

let jobId = '';
let conversationId = '';


app.post("/processVideo/:id", (req, res) => {
    console.log(req.body);
    // symblAuthToken = req.header('accessToken');
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.submitVideoUrl({
        url: req.body.url
    })
        .then(async (resp) => {
            console.log("Response", resp);
            res.send(resp);
            const { data, error } = await supabase
                .from('file_meta')
                .update({ conversation_id: resp.conversationId, job_id: resp.jobId })
                .eq('id', req.params.id);

            res.json({ data, error });
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
})

app.get("/checkstatus/:id", (req, res) => {
    console.log("Job id", req.header('jobId'));
    sdk.getJobStatus({ jobId: req.header('jobId') })
        .then(async (response) => {
            console.log(response);
            const { data, error } = await supabase
                .from('file_meta')
                .update({ video_status: response.status })
                .eq('id', req.params.id);
            res.json({ response, data, error });
        })
        .catch(err => console.error(err));
});

app.get("/getmessage/:id", (req, res) => {
    // console.log("Message",req.headers);
    console.log("Conversation id", req.header('conversationId'));
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.getMessages({ conversationId: req.header('conversationId') })
        .then(async (response) => {
            console.log("Conversation", response);
            const { data, err } = await supabase
                .from('file_meta')
                .update({ conversation: response })
                .eq('id', req.params.id)
            res.json({ data, err, response });
        }).catch(err => res.send(err));
})

app.get("/getsummary/:id", (req, res) => {
    // console.log("Summary",req.headers.accessToken);
    // console.log("Summary",req.headers.jobId);
    console.log("Conversation id", req.header('conversationId'));
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.getSummary({ conversationId: req.header('conversationId') })
        .then(async (response) => {
            console.log("Summary", response);
            const { data, err } = await supabase
                .from('file_meta')
                .update({ summary: response })
                .eq('id', req.params.id)
            res.json({ data, err, response });
        }).catch(err => res.send(err));
})

app.get("/getquestions/:id", (req, res) => {
    console.log("Conversation id", req.header('conversationId'));
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.getQuestions({ conversationId: req.header('conversationId') })
        .then(async (response) => {
            console.log("Questions", response);
            const { data, err } = await supabase
                .from('file_meta')
                .update({ question: response })
                .eq('id', req.params.id)
            res.json({ data, err, response });
        }).catch(err => res.send(err));
})
app.get("/gettopics/:id", (req, res) => {
    console.log("Conversation id", req.header('conversationId'));
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.getTopics({ conversationId: req.header('conversationId') })
        .then(async (response) => {
            console.log("Topics", response);
            const { data, err } = await supabase
                .from('file_meta')
                .update({ topics: response })
                .eq('id', req.params.id)
            res.json({ data, err, response });
        }).catch(err => res.send(err));
})

app.get("/getanalytics/:id", (req, res) => {
    console.log("Conversation id", req.header('conversationId'));
    console.log("Auth token:", req.header('accessToken'));
    sdk.auth(req.header('accessToken'));
    sdk.getAnalytics({ conversationId: req.header('conversationId') })
        .then(async (response) => {
            console.log("Analytics", response);
            const { data, err } = await supabase
                .from('file_meta')
                .update({ analytics: response })
                .eq('id', req.params.id)
            res.json({ data, err, response });
        }).catch(err => res.send(err));
})


// app.post('/upload/image', upload.single('file'), (req, res) => {
//     // console.log(req);
//     if (!req.file) {
//         res.status(400).send('No files found');
//     }
//     const file = req.file;
//     console.log("request body", file.mimetype);
//     console.log("file type", file.buffer.type);

//     supabase.storage
//         .from('uploads')
//         .upload('image/' + file.originalname, file.buffer, {
//             cacheControl: '3600',
//             upsert: false,
//             contentType: "image/jpeg",
//         }).then((response) => {
//             // supabase.from('files').insert([{ original_name: file.originalname, type: file.mimetype }]).then((response) => {
//             //     console.log('table updated successfully');
//             // })
//             console.log(response);
//             res.json({ file });
//             // res.json({ response: response.data });
//         })
// })




// @GET
// app.get("/download/:filename", (req, res) => {
//     // console.log(req.params);
//     supabase.storage.from('uploads').download('video/' + req.params.filename).then(async (response) => {
//         console.log(response);
//         const blob = response.data;
//         const buffer = Buffer.from(await blob.arrayBuffer());
//         await fs.promises.writeFile(req.params.filename, buffer);
//         res.send('File downloaded');
//     }).catch(err => console.log(err))
// })

// @POST: /audio
// desc: uploads the file to the database
// app.post('/audio', upload.single('file'), (req, res) => {
//     // console.log(req);
//     if (!req.file) {
//         res.status(400).send('No files found');
//     }
//     const file = req.file;
//     console.log("request body", file);
//     // res.json({ file: req.file });

//     const { data, error } = supabase.storage
//         .from('uploads')
//         .upload('audio/' + file.originalname, decode('base64FileData'), {
//             contentType: "audio/mpeg",
//         })
//     res.send(data);
// })


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})