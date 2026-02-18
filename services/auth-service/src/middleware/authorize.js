//role based access control

export const authorize = (...allowedRoles)=>{
    return (req,res, next)=>{
        //this inner function is the middleware  that runs evry times a user hits the dashboard point

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

//This syntax is a classic example of a Higher-Order Function. It’s essentially a function that returns another function.

//In standard middleware, Express gives you (req, res, next). But if you want to pass your own custom data (like "admin" or "editor") into that middleware, you need this "wrapper" setup.

//The ... is the Rest Parameter. It allows the function to accept any number of arguments and bundles them into an array(allowedRoles).