//role based access control

export const authorize = (...allowedRoles)=>{
    return (req,res, next)=>{

        if(!req.user){
            return res.status(401).json({
                success:false,
                message:"Not Authtenticated",
            })
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:`Access denied. Role${req.user.role} is not allowed`
            })
        }

        next();
    }
}