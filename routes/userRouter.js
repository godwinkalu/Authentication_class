const { verify } = require('jsonwebtoken')
const { signUp, verifyuser, resendverification, login, forgotPassword, resetPassword, changePassword } = require('../controller/userController')

 const  router  = require('express').Router()

 router.post('/user',signUp)

router.get('/users/verify/:token',verifyuser)

router.post('/users/resend-verification',resendverification)

router.post('/users/login',login)

router.post('/users/forgot/password', forgotPassword)

router.post('/users/reset/password/:token', resetPassword)

router.post('/users/change/password/:token', changePassword)


 module.exports  = router