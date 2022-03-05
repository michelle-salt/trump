const run = (req, res, td) => {
    const content = req.body.content;
    const author = td.user._id;
    const timestamp = Date.now();
    const donald = req.body.donald;
    const createComment = new td.Comment({content, author, timestamp, donald});
    createComment.save();
    res.send(createComment);
}

module.exports = {
    run,
    method: "post",
    path: "/comments/create"
  };