const run = async (req, res, td) => {
    const commentID = req.query.comment;
    const comment = await td.Comment.findById(commentID).exec();
    res.send(comment);
  };
  
  module.exports = {
    run,
    method: "get",
    path: "/comments/view"
  };