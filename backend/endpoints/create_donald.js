const run = async (req, res, td) => {
  const content = req.body.content;
  const author = td.user._id;
  const donald = new td.Donald({content, author, timestamp: Date.now()});
  donald.save();
  res.send(donald);
};

module.exports = {
  run,
  method: "post",
  path: "/donalds/create"
};