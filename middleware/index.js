function verifyAccessTokenGithub(req, res, next) {
  if (!req.cookies.access_token)
    return res.status(403).json({ error: "Access Denied" });

  next();
}

function verifyAccessTokenGoogle(req, res, next) {
  if (!req.cookies.google_access_token)
    return res.status(403).json({ error: "Access Denied" });

  next();
}

module.exports = { verifyAccessTokenGithub, verifyAccessTokenGoogle };
