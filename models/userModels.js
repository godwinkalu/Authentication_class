const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

  firstname:{
    type:String,
    required:true
  },
  lastname:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  isverified:{
    type:Boolean,
    default:false
  }
}, {timestamps:true})

const userModel = mongoose.model ('user', userSchema)

module.exports = userModel