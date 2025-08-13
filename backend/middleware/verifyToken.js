import jwt from "jsonwebtoken";


export const verifyToken = (req,res, next) => {
   
   const token = req.cookies.token
   // if there is no token return unauthorized
   if(!token) return res.status(401).json({success: false, message: "Unauthorized - no token provided"});

   try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // if decoded token is not verified return invalid token
     if (!decoded) return res.status(401).json({success: false, message: "Unauthorized - invalid token"});

     // add userId to the request that is the userId that we have in the token
     req.userId = decoded.userId
     next()

   } catch (error) {
     console.log("Error in verifyToken ", error);
     return res.status(500).json({success: false, message: "server error"});
   }
}