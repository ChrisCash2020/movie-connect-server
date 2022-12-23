const express = require('express')
const userControllers = require('../controllers/userControllers')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })
const { sign } = require('jsonwebtoken')
// const validateToken = async (req, res, next) => {
//   const accessToken = req.cookies['access-token']
//   if (!accessToken)
//     return res.status(400).json({ error: 'User not Authenticated!' })
// }
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

router.route('/matches').post(userControllers.displayMatches)

router
  .route('/faves/:id')
  .get(userControllers.findUserFavs)
  .post(userControllers.saveUserFav)

router.route('/update').post(
  async (req, res, next) => {
    const accessToken = req.cookies['access-token']
    if (!accessToken)
      return res.status(400).json({ error: 'User not Authenticated!' })
  },
  upload.single('img'),
  userControllers.updateUserDetail
)

router.route('/room/:uid1/:uid2').get(userControllers.createRoom)
router.route('/display-rooms/:id').get(userControllers.displayRooms)

router
  .route('/chats/:id')
  .post(userControllers.saveChat)
  .get(userControllers.showChats)

module.exports = router
