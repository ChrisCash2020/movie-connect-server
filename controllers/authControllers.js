const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const signToken = (id) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: 1000 * 3600 * 24 * 30,
  })
}
exports.createSendToken = (user, req, res) => {
  const token = signToken(user)
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 1000 * 3600 * 24 * 30),
    httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
    secure: true,
    sameSite: 'none',
  })
  res.status(200).json(user)
}

exports.auth = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(400).json({ error: 'Not Authorized' })
  } else {
    const decoded = jwt.decode(token, {
      complete: true,
    })
    return res.send({ status: true, user: decoded.payload.id })
  }
}

exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(400).json({ error: 'Not Authorized' })
  }
  const decoded = jwt.decode(token, {
    complete: true,
  })
  req.userId = decoded.payload.id.id
  next()
}
