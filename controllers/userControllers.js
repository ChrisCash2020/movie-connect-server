const express = require('express')
const User = require('../models/User')
const bcrpyt = require('bcryptjs')
const fs = require('fs')
const { json } = require('body-parser')
const { sign, verify, HS256 } = require('jsonwebtoken')

const createTokens = (user) => {
  const accessToken = sign(user, 'jwtsecretplschange')
  return accessToken
}
exports.createNewUser = async (req, res, next) => {
  try {
    let { user, pass, stat, bio, name, gen, pref, bday } = req.body
    let img = req.file.filename
    const hash = await bcrpyt.hash(pass, 10)
    await User.saveUser(user, hash, stat, bio, name, gen, pref, img, bday)
    const [newUser, _] = await User.checkUserCred(user)
    delete newUser[0].pass
    const accessToken = createTokens(newUser[0])

    res.cookie('access-token', accessToken, {
      maxAge: 1000 * 3600 * 24 * 30,
      httpOnly: true,
    })
    res.status(200).json(newUser[0])
  } catch (err) {
    console.log(err)
    next(err)
  }
}
exports.loginUser = async (req, res, next) => {
  let { user, pass } = req.body
  let [checkUser, _] = await User.checkUserCred(user)
  if (checkUser.length == 1) {
    console.log(user)
    const hash = await bcrpyt.compare(pass, checkUser[0].pass)
    if (hash) {
      delete checkUser[0].pass
      const accessToken = createTokens(checkUser[0])

      res.cookie('access-token', accessToken, {
        maxAge: 1000 * 3600 * 24 * 30,
        httpOnly: true,
      })
      res.status(200).json(checkUser[0])
    }
  } else {
    res.status(200).json([])
  }
}
exports.auth = async (req, res, next) => {
  const accessToken = req.cookies['access-token']

  if (!accessToken)
    return res.status(400).json({ error: 'User not Authenticated!' })

  try {
    const validToken = verify(accessToken, 'jwtsecretplschange')
    console.log(validToken)
    if (validToken.id) {
      req.authenticated = true
      res.send({
        status: true,
        user: validToken,
      })
    }
  } catch (err) {
    return res.status(400).json({ error: err })
  }
}

exports.userAvailable = async (req, res, next) => {
  const { user } = req.body
  const [result, _] = await User.checkUserCred(user)
  if (result.length == 0) {
    res.status(200).json({ message: true })
  } else {
    res.status(200).json({ message: false })
  }
}

exports.updateUserDetail = async (req, res, next) => {
  const { id } = req.body
  if (req.file) {
    await User.updateUserDetail('img', req.file.filename, id)
  }
  for (const record in req.body) {
    if (record != 'img' && record != 'id') {
      await User.updateUserDetail(record, req.body[record], id)
    }
  }
  const [user, _] = await User.findOneUser(id)
  delete user[0].pass
  res.clearCookie('access-token')
  const accessToken = createTokens(newUser[0])

  res.cookie('access-token', accessToken, {
    maxAge: 1000 * 3600 * 24 * 30,
    httpOnly: true,
  })
  res.status(200).json(user[0])
}

exports.findUserFavs = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let uid = req.params.id
  const [result, _] = await User.findAllUserLoves(uid)
  const finalResult = []
  for (const key of result) {
    finalResult.push(key.title)
  }
  res.status(200).json(finalResult)
}
exports.saveUserFav = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let uid = req.params.id
  let { title, love } = req.body
  console.log(req.body)
  await User.saveUserFav(title, uid, love)
  res.status(200).json('sent')
}

exports.displayMatches = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let { uid, pref, gen } = req.body
  pref = pref == 'Women' ? 'Woman' : pref == 'Men' ? 'Man' : 'Other'
  gen = gen == 'Woman' ? 'Women' : gen == 'Man' ? 'Men' : 'Other'
  const [result, _] = await User.findAllUserFaves(uid)
  let [rooms, ___] = await User.findUserRooms(uid)
  let allMatches = []
  rooms = rooms.map((item) => {
    if (item.uid1 == uid) {
      return item.uid2
    } else {
      return item.uid1
    }
  })
  for (let i = 0; i < result.length; i++) {
    let [match, _] = await User.findMovieMatches(
      result[i].title,
      uid,
      pref,
      gen
    )
    allMatches.push({
      id: result[i].title,
      matches: match.filter((item) => !rooms.includes(item.uid)),
    })
  }
  // console.log(...allMatches)
  res.status(200).json([...allMatches])
}

// Need to do a check if a room already exists
exports.createRoom = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })
  let uid1 = req.params.uid1
  let uid2 = req.params.uid2
  const [test, ___] = await User.checkRoomExists(uid1, uid2)
  console.log(test)
  if (test.length > 0) {
    res.status(200).json({ message: 'user exists' })
  } else {
    const [create, _] = await User.createRoom(uid1, uid2)
    const [id, __] = await User.getCurrentRoom()
    const roomId = id[0]['MAX(roomId)']
    res.status(200).json(roomId)
  }
}

exports.displayRooms = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let uid = req.params.id
  const [result, _] = await User.findUserRooms(uid)
  let allMatches = []
  for (let i = 0; i < result.length; i++) {
    const recipientId = result[i].uid1 == uid ? result[i].uid2 : result[i].uid1
    const [info, __] = await User.findOneUser(recipientId)
    delete info[0].pass

    const [chats, ___] = await User.getChats(result[i].roomId)
    allMatches.push({
      roomId: result[i].roomId,
      info: info[0],
      chats: chats,
    })
  }
  res.status(200).json(allMatches)
}

exports.saveChat = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let roomId = req.params.id
  let { text, uid, author, time } = req.body
  const [result, _] = await User.saveChats(text, uid, author, roomId, time)
  res.status(200).json('sent')
}
exports.showChats = async (req, res, next) => {
  // if (!validateToken(req))
  //   return res.status(400).json({ error: 'User not Authenticated!' })

  let roomId = req.params.id
  const [chats, ___] = await User.getChats(roomId)
  res.status(200).json(chats)
}
