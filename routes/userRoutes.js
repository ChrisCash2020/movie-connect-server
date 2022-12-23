const express = require('express')
const userControllers = require('../controllers/userControllers')
const authControllers = require('../controllers/authControllers')

const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })
const { sign } = require('jsonwebtoken')
router.route('/auth/logout').delete((req, res) => {
  res.set('Authorization', `loggedout`)
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'none',
  })
  res.status(200).json('cookie cleared')
})
router.route('/username_check').post(userControllers.userAvailable)

router
  .route('/register')
  .post(upload.single('img'), userControllers.createNewUser)

router.route('/login').post(userControllers.loginUser)

router.route('/auth').get(authControllers.auth)

// Protect all routes after this middleware
router.use(authControllers.protect)

router.route('/matches').post(userControllers.displayMatches)

router
  .route('/faves/:id')
  .get(userControllers.findUserFavs)
  .post(userControllers.saveUserFav)

router
  .route('/update')
  .put(upload.single('img'), userControllers.updateUserDetail)

router.route('/room/:uid1/:uid2').post(userControllers.createRoom)
router.route('/display-rooms/:id').get(userControllers.displayRooms)

router
  .route('/chats/:id')
  .post(userControllers.saveChat)
  .get(userControllers.showChats)

module.exports = router
