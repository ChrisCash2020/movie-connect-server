const db = require('../config/db')

class User {
  constructor() {}
  //auth functions
  static saveUser(
    username,
    password,
    mode,
    bio,
    name,
    gender,
    preferences,
    image
  ) {
    const sql = `
INSERT INTO Users( 
    username,
    password,
    mode,
    bio,
    name,
    gender,
    preferences,
    image )
    VALUES( ? , ? , ? , ? , ? , ? , ? , ? )`
    return db.execute(sql, [
      username,
      password,
      mode,
      bio,
      name,
      gender,
      preferences,
      image,
    ])
  }
  static findNewUser() {
    const sql = 'SELECT id, username FROM Users ORDER BY id DESC LIMIT 1'
    return db.execute(sql)
  }
  static findOneUser(id) {
    const sql = `SELECT * FROM Users WHERE id = ? `
    return db.execute(sql, [id])
  }

  static checkUserCred(username) {
    const sql = `SELECT * FROM Users WHERE username = ? `
    return db.execute(sql, [username])
  }
  static saveUserFav(title, uid) {
    const sql = `
INSERT INTO Favorites( title , uid )
    VALUES( ? , ? )`
    return db.execute(sql, [title, uid])
  }

  // Invoked for when user mode is set to taken signifying their are using the couple functionality
  static checkCoupleMatch(uid1, uid2) {
    const sql = `SELECT DISTINCT f.title, f.uid FROM Favorites as f JOIN Users as u on f.uid = u.id  WHERE f.uid = ? OR f.uid = ? `
    return db.execute(sql, [uid1, uid2])
  }
  static deleteCoupleMatches(uid1, uid2) {
    const sql = `DELETE f.title FROM Favorites as f JOIN Users as u on f.uid = u.id  WHERE f.uid = ? OR f.uid = ?`
    return db.execute(sql, [uid1, uid2])
  }

  // invoked when the user goes to matches tab,
  // it works by finding the titles the user has liked and then looping through each movie title with the
  // match function below
  static findAllUserFaves(uid) {
    const sql = `SELECT distinctrow title FROM Favorites as f JOIN Users as u ON u.id = f.uid WHERE  f.uid = ? `
    return db.execute(sql, [uid])
  }
  // invoked when swiped right to determine if their is a match
  // invoked when the user goes to the match tab, it is used to find the matches by title
  static findMovieMatches(title, uid, preferences) {
    const sql = `SELECT distinctrow f.title, f.uid, u.bio, u.name, u.gender, u.preferences, u.image  FROM Favorites as f JOIN Users as u ON u.id = f.uid WHERE f.title = ? AND f.uid != ? AND mode = 'single' AND u.gender = ? `
    return db.execute(sql, [title, uid, preferences])
  }

  //is invoked to check if a room exists when in the matches tab
  static checkRoomExists(uid1, uid2) {
    const sql =
      'SELECT * FROM Rooms WHERE ( uid1 = ? OR uid2 = ? ) OR ( uid1 = ? OR uid2 = ? )'
    return db.execute(sql, [uid1, uid2, uid2, uid1])
  }

  //is check fails this creates a room
  static createRoom(uid1, uid2) {
    const sql = `
INSERT INTO Rooms ( uid1, uid2 )
    VALUES( ? , ? );
    `
    return db.execute(sql, [uid1, uid2])
  }

  //In the frontend when the user is sent to the messages tab this function is invoked
  //
  // is used to find the Users rooms

  // In the controller it can be configured to find the specific recipients by loop through geting all the
  // uids that aren't the main users uid and using that to call the FindOnUser function and placing them in
  // an array of objects the object will also have an extra property of roomid to keep tracks of which data to display

  // In the controller it can be configured to find the specific chats by looping through all the room id
  // I will call the getChats function getChats that uses that id to place all the chats (will be sent as array of obj) that will have the key of roomid

  static findUserRooms(uid) {
    const sql = 'SELECT * FROM Rooms WHERE uid1 = ? OR uid2 = ?'
    return db.execute(sql, [uid, uid])
  }

  static getSpecificChats(roomId) {
    const sql = `SELECT * FROM Chats WHERE Chats.roomid = ? `
    return db.execute(sql, [roomId])
  }
}

module.exports = User
