
const invariant = require('invariant')
const jwt = require('jsonwebtoken')


const createToken = (userId) => {
  return jwt.sign(
    { userId, expiresIn: '14d' },
    process.env.APP_SECRET
  )
}


const getUserId = (ctx) => {
  const authorization = ctx.request.get('authorization')
  invariant(authorization, 'no authorization header')
  const token = authorization.replace('Bearer ', '')
  const { userId } = jwt.verify(token, process.env.APP_SECRET)
  invariant(userId, 'authorization failed')
  return userId
}


module.exports = { createToken, getUserId }