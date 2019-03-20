const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const faker = require('faker')

const {
  Event
} = require('../../models/Event'), {
  User
} = require('../../models/User'), {
  Booking
} = require('../../models/Booking')

var generateAuthToken = (user) => {
  let token = jwt.sign({
    userId: user.id,
    userEmail: user.email
  }, "SECRETKEY", {
    expiresIn: "1h"
  })
  return {
    userId: user.id,
    token,
    tokenExpiration: 1
  }
}


module.exports = {
  events: async () => {
    try {
      let events = await Event.find({})
        .populate({
          path: 'creator',
          select: 'email'
        })
      // console.log(events)
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: {
            ...event._doc.creator._doc,
            _id: event._doc.creator.id
          }
        }
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  bookings: async ({userId}) => {
    try {
      let bookings = await Booking.find({user:userId})
        .populate({
          path: 'event',
          populate:{path:'creator'}
        })
        .populate({
          path: 'user'
        })
        
        .exec()
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          event: {
            ...booking._doc.event._doc,
            _id: booking._doc.event.id
          },
          user: {
            ...booking._doc.user._doc,
            _id: booking._doc.user.id
          },
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        }
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  createEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error('Not Authorized')

      // let user = await User.find({}).select('_id')
        // .lean().exec()
      // let randomUser = user[Math.floor(Math.random() * 4)]._id

      let event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: parseFloat(args.eventInput.price),
        date: new Date(args.eventInput.date),
        creator: req.userId
      })

      let newEvent = await event.save()

      await User.findByIdAndUpdate(event.creator, {
        $push: {
          createdEvents: event._id
        }
      })

      return newEvent


    } catch (error) {
      console.log(error)
      throw error
    }
  },
  createUser: (args) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(args.userInput.password, salt)

    let user = new User({
      email: args.userInput.email,
      password: hash
    })

    return user.save()
      .then(doc => {
        console.log(doc)
        let token = generateAuthToken(user)
        return token
      })
      .catch(error => {
        console.log(error)
        throw error
      })
  },
  bookEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error('Not Authorized')

      // let user = await User.find({}).select('_id')
        // .lean().exec()
      // let randomUser = user[Math.floor(Math.random() * 4)]._id
      let eventId = await Event.findById(args.eventId)
      // TODO : req.userId for randomUser
      let booking = new Booking({
        user: req.userId,
        event: eventId
      })

      let result = await booking.save()
      return {
        ...result._doc,
        _id: result.id,
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString()
      }
    } catch (error) {
      console.log(error)
      throw error
    }

  },
  cancelBooking: async (args, req) => {
    try {
      if (!req.isAuth) throw new Error('Not Authorized')

      await Booking.deleteOne({
        _id: args.bookingId
      })
      return 'Booking canceled'
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  login: async ({
    email,
    password
  }) => {
    try {

      let user = await User.findOne({
        email
      })
      if (!user) throw new Error("No such user exists.")
      if (!bcrypt.compareSync(password, user.password)) throw new Error('Invalid password')
      else {
        let token = generateAuthToken(user)
        return token
      }

    } catch (error) {
      console.log(error)
      return error
    }

  },
  authToken: async (args,req) => {
    try {
      if (!req.isAuth) throw new Error('Session Expired')
      
      const user = {
        id : req.userId,
        email : req.userEmail
      }
      let token = generateAuthToken(user)
      return token
    } catch (error) {
      console.log(error)
      throw error
    }
  },
}