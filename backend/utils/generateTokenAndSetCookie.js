import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (res, userId) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
        })
        res.cookie("token", token, {
            httpOnly: true, // cookie cannot be accessed by client side js, this prevents cross site scripting attacks - XSS
            secure: process.env.NODE_ENV === "production", 
            // on localhost in our development env is http on production on a server is https, that's why we set it as "secure" when it's on production mode 
            sameSite: "strict", // prevents csrf attack
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return token;
}

