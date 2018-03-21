
const { createToken } = require('../utils')
const invariant = require('invariant')


const authenticate = async (parent, args, ctx, info) => {

  invariant(args.facebookToken, 'need to supply a facebookToken as an argument')

  const endpoint = 'https://graph.facebook.com/me?fields=id%2Cname%2Cfriends'
  const response = await fetch(`${ endpoint }&access_token=${ args.facebookToken }`)
  const { id : facebookId, name : facebookName, friends : { data : facebookFriends } } = await response.json()

  invariant(facebookId, 'no id in facebookUser')

  const userExists = await ctx.db.exists.User({ facebookId })

  const friends = (
    await Promise.all(
      facebookFriends.map(({ id : facebookId }) => (
        ctx.db.query.user({ where : { facebookId } }, `{ id }`)
      ))
    )
  ).filter((friend) => friend)

  let data = {
    ...(
      userExists
        ? null
        : { facebookId }
    ),
    facebookName,
    ...(
      friends.length > 0
        ? { facebookFriends : { connect : friends } }
        : null
    )
  }

  const user = userExists
    ? await ctx.db.mutation.updateUser({ data, where : { facebookId } })
    : await ctx.db.mutation.createUser({ data })

  const token = createToken(user.id)

  invariant(!(!user && !token), 'neither token nor user are defined')
  invariant(token, 'token is undefined')
  invariant(user, 'user is undefined')

  return { user, token }

}


module.exports = { authenticate }