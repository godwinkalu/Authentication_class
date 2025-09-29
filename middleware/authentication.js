 const jwt = require('jsonwebtoken');
const userModel = require('../models/userModels');
 exports.authenticate  = async (req,res,next)=>{

  try {
    const auth = req.headers.authorization;
    const token = auth.split(' ')[1]
     
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message:'Authentication failed: user not found'
      })
    }
    // pass the payload to
    req.user = decoded;

    next()
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(500).json({
        message:'session expired:Please login to continue'
      })
    }
    res.status(500).json({
      message:error.message
    })
  }
 }