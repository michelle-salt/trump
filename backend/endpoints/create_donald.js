const run = async (req, res, td) => {
  if (!req.data.authorized) {
    console.log(req.data);
    res.send({error: req.data.error});
    return;
  }
  const content = req.body.content;
  const author = req.data.id;
  const donald = new td.Donald({content, author, timestamp: Date.now()});
  donald.save();
  res.send(donald);
};

module.exports = {
  run,
  method: "post",
  path: "/donalds/create"
};