const run = async (req, res, td) => {
  const donaldID = req.query.donald;
  const donald = await td.Donald.findById(donaldID).populate("author").exec();
  res.send(donald);
};

module.exports = {
  run,
  method: "get",
  path: "/donalds/view"
};