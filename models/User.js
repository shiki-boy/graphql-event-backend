const mongoose = require('mongoose')

const {graphqlDBConn} = require('../db/mongoose') 

const Schema = mongoose.Schema;

const EventSchema = new Schema({
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  createdEvents:[{
    type:Schema.Types.ObjectId,
    ref:'Event'
  }]
})

var User = graphqlDBConn.model('User',EventSchema)

module.exports = {User}

