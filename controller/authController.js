const home = async (req,res,next) => {
    const data = {message:"Hello"};
    try {
        res.json(data);
    } catch (err) {
        next(err)
    }
}

module.exports = {
    home
}