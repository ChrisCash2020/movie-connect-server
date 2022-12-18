const db = require('../config/db')

class User {
  constructor() {}
  //auth functions
  static saveUser(user, pass, stat, bio, name, gen, pref, img, bday) {
    const sql = `
INSERT INTO Users( 
user, pass, stat, bio, name, gen, pref, img, bday
     )
    VALUES( ? , ? , ? , ? , ? , ? , ? , ? , ? )`
    return db.execute(sql, [user, pass, stat, bio, name, gen, pref, img, bday])
  }
  static findOneUser(id) {
    const sql = `SELECT * FROM Users WHERE id = ? `
    return db.execute(sql, [id])
  }

  static checkUserCred(user) {
    const sql = `SELECT * FROM Users WHERE user = ? `
    return db.execute(sql, [user])
  }
  static saveUserFav(title, uid, love) {
    const sql = `
INSERT INTO Favorites( title, uid, love )
    VALUES( ? , ? , ? )`
    return db.execute(sql, [title, uid, love])
  }

  static updateUserDetail(record, value, id) {
    const sql = `UPDATE Users
    SET ${record} = ?
    WHERE  id = ${id} `
    return db.execute(sql, [value])
  }
  // Invoked for when user stat is set to taken signifying their are using the couple functionality
  static checkCoupleMatch(uid1, uid2) {
    const sql = `SELECT DISTINCT f.title, f.uid FROM Favorites as f JOIN Users as u on f.uid = u.id  WHERE f.uid = ? OR f.uid = ? `
    return db.execute(sql, [uid1, uid2])
  }
  static deleteCoupleMatches(uid1, uid2) {
    const sql = `DELETE f.title FROM Favorites as f JOIN Users as u on f.uid = u.id  WHERE f.uid = ? OR f.uid = ?`
    return db.execute(sql, [uid1, uid2])
  }

  // invoked when the user goes to matches tab,
  // it works by finding the titles the user has loved and then looping through each movie title with the
  // match function below
  static findAllUserFaves(uid) {
    const sql = `SELECT distinctrow title FROM Favorites as f JOIN Users as u ON u.id = f.uid WHERE  f.uid = ? AND f.love = 'y' `
    return db.execute(sql, [uid])
  }
  static findAllUserLoves(uid) {
    const sql = `SELECT distinctrow title FROM Favorites as f JOIN Users as u ON u.id = f.uid WHERE  f.uid = ? `
    return db.execute(sql, [uid])
  }
  // invoked when swiped right to determine if their is a match
  // invoked when the user goes to the match tab, it is used to find the matches by title
  static findMovieMatches(title, uid, pref, gen) {
    const sql = `SELECT distinctrow f.uid, u.bio, u.name, u.gen, u.pref, u.img, u.bday FROM Favorites as f JOIN Users as u ON u.id = f.uid WHERE f.title = ? AND f.uid != ? AND stat = 'single' AND u.gen = ? AND u.pref = ? `
    return db.execute(sql, [title, uid, pref, gen])
  }

  //is invoked to check if a room exists when in the matches tab
  static checkRoomExists(uid1, uid2) {
    const sql =
      'SELECT distinctrow * FROM Rooms WHERE ( uid1 = ? AND uid2 = ? ) OR ( uid1 = ? AND uid2 = ? )'
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
  static getCurrentRoom() {
    const sql = 'SELECT MAX(roomId) FROM Rooms'
    return db.execute(sql)
  }

  static findUserRooms(uid) {
    const sql = 'SELECT * FROM Rooms WHERE uid1 = ? OR uid2 = ?'
    return db.execute(sql, [uid, uid])
  }

  static getChats(roomId) {
    const sql = `SELECT * FROM Chats WHERE Chats.roomid = ? `
    return db.execute(sql, [roomId])
  }
  static saveChats(text, uid, author, roomId, time) {
    const sql = `INSERT INTO Chats( text, uid, author, roomId, time )
    VALUES( ? , ? , ? , ? , ? );`
    return db.execute(sql, [text, uid, author, roomId, time])
  }
}

module.exports = User
