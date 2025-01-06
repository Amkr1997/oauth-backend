// helper functions

function setSecureCookie(res, token) {
  res.cookie("access_Token", token, {
    httpOnly: true,
    maxAge: 60 * 1000,
  });

  return res;
}

module.exports = { setSecureCookie };
