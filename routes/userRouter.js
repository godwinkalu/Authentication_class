const { verify } = require('jsonwebtoken')
const { signUp, verifyuser, resendverification, login, forgotPassword, resetPassword, changePassword, getAll } = require('../controller/userController')
const { authenticate } = require('../middleware/authentication')
const { signUpValidator, loginValidator } = require('../middleware/validator')

 const  router  = require('express').Router() 

 router.post('/user',signUpValidator, signUp)

router.get('/users/verify/:token',verifyuser)

router.post('/users/resend-verification',resendverification)

router.post('/users/login',loginValidator,login)

router.post('/users/forgot/password', forgotPassword)

router.post('/users/reset/password/:token', resetPassword)

router.post('/users/change/password/:token', changePassword)

router.get('/users' , authenticate, getAll)

router.patch('/users/change/password', authenticate ,changePassword)


 module.exports  = router