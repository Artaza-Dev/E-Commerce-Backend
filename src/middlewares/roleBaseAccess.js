
module.exports.checkRole = (allowRole)=>{
    return (req, res, next)=>{
        if(!allowRole.includes(req.user.role)){
            return res.status(403).json({ message: "Access denied", role: req.user.role  });
        }
        next()
        
    }
}