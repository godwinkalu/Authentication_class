const jol = require('joi')

exports.signUpValidator = async (req,res,next)=>{
    const Schema = Joi.object({
        firstname: Joi.string().min(3).max(30).pattern(new RegExp('^[A-Za-z]+$')).
        required().messages({
          'any.required':'firstname is required',
          'string.empty':'firstname cannot be empty',
          'string.min':'firstname should contain at least 3 characters',
          'string.max':'firstname should not be more than 30 characters long',
          'string.pattern.base':'firstname can only contain letters with no spaces'
        }),
        lastname: Joi.string().min(3).max(30).pattern(new RegExp('^[A-Za-z]+$')).
        required().message({
           'any.required':'lastname is required',
          'string.empty':'lastname cannot be empty',
          'string.min':'lastname should contain at least 3 characters',
          'string.max':'lastname should not be more than 30 characters long',
          'string.pattern.base':'lastname can only contain letters with no spaces'

        }),
        email: Joi.string().email().required().message({
           'any.required':'Email is required',
          'string.empty':'Email cannot be empty',
          'string.email':'Invaild email format'
          
        }),
        password: Joi.string().pattern(new RegExp ( '^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$')).
        required().message({
           'any.required':'password is required',
          'string.empty':'password cannot be empty',
          'string.pattern.base':'password must contain at least one UpperCase, Lowercase,  Digits and a special character [#?!@$%^&*-]',
        })
    
    })
   const {error} = Schema.validate(req.body)
   if (error) {
    return res.status(400).json({
        message: error.details[0].message
    })
   }
   next()
} 

exports.loginValidator  = async (req,res,next)=>{
  const schema = jol.object({

    email: Joi.string().email().required().message({
           'any.required':'Email is required',
          'string.empty':'Email cannot be empty',
          'string.email':'Invaild email format',
    }),
    password:Joi.string().pattern(new RegExp ( '^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,}$')).
        required().message({
           'any.required':'password is required',
          'string.empty':'password cannot be empty',
          
        })

  })

    const {error} = Schema.validate(req.body)
   if (error) {
    return res.status(400).json({
        message: error.details[0].message
    })
   }
   next()
}