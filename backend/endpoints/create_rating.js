const run = async (req, res, td) => {
    const like = req.body.like;
    const author = td.user._id;
    const donald = req.body.donald;
    const createLike = new td.Rating({like, donald, author});
    createLike.save();
    res.send(createLike);
  };
  
  module.exports = {
    run,
    method: "post",
    path: "/ratings/create"
  };