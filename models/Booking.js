const mongoose = require('mongoose')

const {
  graphqlDBConn
} = require('../db/mongoose')

const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

var Booking = graphqlDBConn.model('Booking',BookingSchema)

module.exports = {Booking}
