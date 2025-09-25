const userModel = require('../models/userModels')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { signUpTemplate, resetPasswordTemplate } = require('../utils/emailTemplates')
const emailSender = require('../middleware/nodemailer')
const {verificationTemplate} = require('../utils/emailTemplates')
const e = require('express')
exports.signUp = async (req,res)=>{

  try {
    const{firstname,lastname,password,email} = req.body

    const userExists = await userModel.findOne({email:email.toLowerCase()});
    if (userExists) {
      return res.status(400).json({
        message:'user already exists'
      })
    }
    //encyprt user password
    const saltedRounds = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,saltedRounds)


    const user = new userModel({
      firstname,
      lastname,
      email:email.toLowerCase(),
      password:hashedPassword
    });


    await user.save()

  //generate a token for the user
    const token = jwt.sign({
      id:user._id,
      email:user.email
    },process.env.JWT_SECRET,{expiresIn: '1h'});

    const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`
    console.log('link:',link);
    
//Email option for sending email
    const emailOption = {
      email:user.email,
      subject:"Graduation Note",
      html:signUpTemplate(link,user.firstname)
    }
// send the email to the user
    await emailSender(emailOption);

    res.status(201).json({
      message:'signUp successfully',
      data:user
    })

  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}

exports.verifyuser = async (req,res)=>{
  try {
    const {token} = req.params
    if (!token) {
      return res.status(400).json({
        message:'Token not found'
      })
    }
     const decoded = jwt.verify(token,process.env.JWT_SECRET)
     const user = await userModel.findById(decoded.id)
     if (!user) {
       return res.status(400).json({
        messsage:'user not found'
       })
     }
      if (user.isverified) {
        return res.status(400).json({
          message: 'user already verified, please proceed to login'
        })
      }

     user.isverified = true 
       await user.save()
     res.status(200).json({
      message:'user verified successfully'
     }) 
  } catch (error) {
    if (error.message === jwt.expired) {
      return res.status(500).json({
        message:'session expired, please resend verification.'
      })
    }


    res.status(500).json({
      message:error.message
    })
  }
}

exports.resendverification = async (req,res)=>{

  try {
    const {email} = req.body;
    const user = await userModel.findOne({email:email.toLowerCase()})
    if (!user) {
      return res.status(404).json({
        message:'user not found'
      })
      
    }
    if (user.isverified) {
        return res.status(400).json({
          message: 'user already verified, please proceed to login'
        })
      }
      // Generate a new token
    const token = jwt.sign({
      email:user.email,
      id:user._id
    },process.env.JWT_SECRET,{expiresIn: '30mins'})

    const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`
    const options = {
      email:user.email,
      subject:'Verification Email',
      html:verificationTemplate(link,user.firstname)
    }
    await emailSender(options)
    res.status(200).json({
      message:'verification email sent successfully please check your email to verify.'
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
exports.login = async (req,res)=>{

  try {
    const {email,password} = req.body;
    const user = await userModel.findOne({email:email.toLowerCase()})
    if (!user) {
      return res.status(404).json({
        message:'user not found'
      })
    }
    // check if there password is correct
    const passwordCorrect = await bcrypt.compare(password,user.password)
    console.log(passwordCorrect);
    
    if (passwordCorrect === false) {
      return res.status(400).json({
        message:'Incorrect password'
      })
    }
    if (user.isverified) {
      return res.status(401).json({
        message:'user not verify check your email for verification link'
      })
    }
    // generate token for the user
    
    const token = jwt.sign({
      email:user.email,
      id:user._id
    },process.env.JWT_SECRET,{expiresIn: '1hr'});

    //send a success responds
    res.status(200).json({
      message:'login successful',
      data:user,
      token
    })
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}
exports.forgotPassword = async (req,res)=>{

  try {
    const {email}=req.body;


    // find the user with email and check if it exist

    const user = await userModel.findOne({email:email.toLowerCase()})
    if (!user) {
      return res.status(400).json({
        message: 'user not found'
      })
    }
    // Generate a token and a link
    const token = jwt.sign ({
      email:user.email,
      id:user._id
    },process.env.JWT_SECRET,{expiresIn: '10mins'})
    const link = `${req.protocol}://${req.get('host')}/users/reset/password/${token}`
     
    // Create email options
    const options = {
      email:user.email,
      subject:'Reset Password',
      html:resetPasswordTemplate(link,user.firstname)
    }
    // send the email to the user
    await emailSender(options)
// success respons
    res.status(200).json({
      message:'Reset password request is successful'
    })
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}
exports.resetPassword = async (req,res)=>{

  try {
    //get token from thr params
    const {token} = req.params;
    // Extract the password from the request body
    const {newPassword, confirmPassword} = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message:'password does not match'
      })
    }
   // verify the token with jwt

    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    // find the user decoded
    const user = await userModel.findById(decoded.id)
    if (!user) {
      return res.status(404).json({
        message:'user not found'
      })
    }
    // Enc rypt 
     const salt = await bcrypt.genSalt(10)
     const hashedPassword = await bcrypt.hash(newPassword,salt)

    
    user.password = newPassword;
    await user.save()

    res.status(200).json({
      message:'password reset successfully'
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message:'link expired ,please request a new link'
      })
    }
     res.status(500).json({
      message:error.message
    })
  }
}
exports.changePassword = async (req,res)=>{

  try {
    const {token} = req.params;

    const  {oldPassword,newPassword, confirmPassword}= req.body;
    
    const decoded = jwt.verify (token,process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id)
    if (!user) {
      res.status(404).json({
        message:'user not found'
      })
      const checkOldPassword = await bcrypt.compare (oldPassword,user.password);
      if (!checkOldPassword) {
        return res.status(400).json({
          message:'Incorrect Password'
        })
      }
    }
    // confrim new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message:'password is not correct'
      })
    }
    //  hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword,salt)

    // save the new password
    user.password = hashedPassword 
    await user.save()

    return res.status(200).json({
      message: 'password changed successfully'
    })

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(500).json({
        message:'session time out,please login to your account'
      })
    }
    res.status(500).json({
      message:error.message
    })
  }
}