const mongoose = require('mongoose')

mongoose.Promise = global.Promise;
// var graphqlDBConn = mongoose.createConnection('mongodb://localhost:27017/graphQLDBevents', {
// useCreateIndex: true,
// useNewUrlParser: true
// })
let localDB;
try {
  var graphqlDBConn = mongoose.createConnection(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-itf8s.mongodb.net/graphQLDBevents?retryWrites=true/`, {
    useCreateIndex: true,
    useNewUrlParser: true
  })
} catch (error) {
  var graphqlDBConn = mongoose.createConnection('mongodb://localhost:27017/graphQLDBevents', {
    useCreateIndex: true,
    useNewUrlParser: true
  })

}

module.exports = {
  graphqlDBConn
}