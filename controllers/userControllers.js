const express = require('express')
const User = require('../models/User')
const bcrpyt = require('bcryptjs')

exports.createNewUser = async (req, res, next) => {
  try {
    let { username, password, mode, bio, name, gender, preferences, image } =
      req.body
    console.log(req.body)
    const hash = await bcrpyt.hash(password, 10)
    await User.saveUser(
      username,
      hash,
      mode,
      bio,
      name,
      gender,
      preferences,
      image
    )
    const [newUser, _] = await User.findNewUser()
    req.session.user = { id: newUser[0].id, username: newUser[0].username }
    res.status(200).json(newUser)
  } catch (err) {
    console.log(err)
    next(err)
  }
}
exports.getUserById = async (req, res, next) => {
  let userid = req.params.id
  try {
    const [posts, _] = await User.findOneUser(userid)
    res.status(200).json({ ...posts })
  } catch (err) {
    console.log(err)
    next(err)
  }
  exports
}

exports.loginUser = async (req, res, next) => {
  let { username, password } = req.body
  let [user, _] = await User.checkUserCred(username)
  if (user.length == 1) {
    const hash = await bcrpyt.compare(password, user[0].password)
    if (hash) {
      delete user[0].password
      req.session.user = user[0]
      res.status(200).json(user[0])
    }
  } else {
    res.status(200).json([])
  }
}
exports.auth = async (req, res, next) => {
  if (req.session.user) {
    res.send({ status: true, user: req.session.user })
  } else {
    res.send({
      status: false,
      user: { id: '', username: '', mode: '' },
    })
  }
}

exports.postFave = async (req, res, next) => {
  let { title, mode, preferences, uid1, uid2 } = req.body
  let message = { message: 'sent' }
  await User.saveUserFav(title, uid1)
  if (mode == 'taken') {
    const [result, _] = await User.checkCoupleMatch(uid1, uid2)
    message.message = 'no match'
    if (result.length == 2) {
      message.message = 'match'
    }
    res.status(200).json(message)
  } else {
    const [result, _] = await User.findMovieMatches(title, uid1, preferences)
    if (result.length > 0) {
      // a match is found
      res.status(200).send(result)
    } else {
      res.status(200).json(message)
    }
  }
}

exports.displayMatches = async (req, res, next) => {
  let { uid, preferences } = req.body
  const [result, _] = await User.findAllUserFaves(uid)
  let allMatches = []
  for (let i = 0; i < result.length; i++) {
    const [match, _] = await User.findMovieMatches(
      result[i].title,
      uid,
      preferences
    )
    allMatches.push(match)
  }
  console.log(...allMatches)
  res.status(200).json(...allMatches)
}

exports.createRoom = async (req, res, next) => {
  let { uid1, uid2 } = req.body

  const [create, _] = await User.createRoom(uid1, uid2)

  res.status(200).json('sent')
}
