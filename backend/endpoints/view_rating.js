const run = async (req, res, td) => {
    const ratingID = req.query.rating;
    const rating = await td.Rating.findById(ratingID).exec();
    res.send(rating);
  };
  
  module.exports = {
    run,
    method: "get",
    path: "/ratings/view"
  };