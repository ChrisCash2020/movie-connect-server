const express = require('express')
const userControllers = require('../controllers/userControllers')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })
const { sign } = require('jsonwebtoken')
const validateToken = async (req, res, next) => {
  const accessToken = req.cookies['access-token']
  if (!accessToken)
    return res.status(400).json({ error: 'User not Authenticated!' })
}
router.route('/auth/logout').post((req, res) => {
  res.clearCookie('access-token')
  res.status(200).json('cookie cleared')
})
router.route('/username_check').post(userControllers.userAvailable)

router
  .route('/register')
  .post(upload.single('img'), userControllers.createNewUser)

router.route('/login').post(userControllers.loginUser)

router.route('/auth').get(userControllers.auth)

router.route('/matches').post(validateToken, userControllers.displayMatches)

router
  .route('/faves/:id')
  .get(validateToken, userControllers.findUserFavs)
  .post(validateToken, userControllers.saveUserFav)

router
  .route('/update')
  .post(validateToken, upload.single('img'), userControllers.updateUserDetail)

router.route('/room/:uid1/:uid2').get(validateToken, userControllers.createRoom)
router
  .route('/display-rooms/:id')
  .get(validateToken, userControllers.displayRooms)

router
  .route('/chats/:id')
  .post(validateToken, userControllers.saveChat)
  .get(validateToken, userControllers.showChats)

module.exports = router
