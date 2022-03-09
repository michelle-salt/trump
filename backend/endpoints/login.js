const run = async (req, res, td) => {
  const username = req.body.username;
  const password = req.body.password;

  const account = await td.Account.findOne({username, password}).populate("user").exec();
  if (!account) {
    res.send({error: "You suck"});
    return;
  }
  console.log(account);
  const token = td.sign({id: account.user._id.toString()}, {expiresIn: 60 * 15});
  res.send({token});
};

module.exports = {
  run,
  method: "post",
  path: "/login"
};