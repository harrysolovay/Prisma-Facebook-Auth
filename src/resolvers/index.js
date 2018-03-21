
const { authenticate } = require('./authenticate')
const { createToken, getUserId } = require('../utils')



const Mutation = { authenticate }



const Query = {

  refreshToken : async (parent, args, ctx, info) => {
    const id = getUserId(ctx)
    const token = createToken(id)
    const user = await ctx.db.query.user({ where : { id } })
    return { token, user }
  },

  me : async (parent, args, ctx, info) => {
    const id = getUserId(ctx)
    return await ctx.db.query.user({ where : { id } }, info)
  }
  
}



const AuthPayload = {
  user : ({ user : { id } }, args, ctx, info) => {
    return ctx.db.query.user({ where : { id } }, info)
  }
}


module.exports = {
  Query,
  Mutation,
  AuthPayload,
}
