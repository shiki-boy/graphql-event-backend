const express = require('express')
const bodyParser = require('body-parser')
const graphQLhttp = require('express-graphql')
const multer = require('multer')

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolver = require('./graphql/resolvers/index')
const {
  authenticate
} = require('./middleware/authenticate'), {
  Event
} = require('./models/Event')

const app = express()

const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*")
  res.setHeader('Access-Control-Allow-Methods', "POST,GET,OPTIONS")
  res.setHeader('Access-Control-Allow-Headers', "Content-Type, Authorization")
  if (req.method === 'OPTIONS')
    return res.sendStatus(200)
  next()
})

// ! file uploads
const upload = multer({
  // dest: './frontend/src/assets',      // ? will not use coz will get removed from heroku
  limits: {
    fileSize: 1000000, // * in bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/))
      cb(new Error('File must be an image file'))
    else
      cb(undefined, true)
  }
})
app.post('/upload/img',  upload.single('event-img'), async (req, res) => {
  try {

    // if (!req.isAuth) throw new Error('Not Authorized')

    let img = req.file.buffer
    // let eventID = req.body._id
    let eventID = "5c89131afedbba0ae4d02d66"
    await Event.findByIdAndUpdate(eventID, {
      image: img
    })

    res.send('done')

  }
  catch(err){
    console.log('upload err');
    throw new Error(err)
  }

}, (error, req, res, next) => {
  res.status(400).send(error.message)
})


app.get('', (req, res) => res.send('<h1>GraphQL</h1>'))

app.post('/test', (req, res) => {
  console.log('runnin');
  console.log(req.body);
  res.send('1000')
})

app.use(authenticate)

app.use('/graphql', graphQLhttp({
  schema: graphQlSchema,
  rootValue: graphQlResolver,
  graphiql: true
}))

app.listen(port, () => console.log('backend server started on '+port))