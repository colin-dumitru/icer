package service.user

import anorm._
import model.User
import play.api.db.DB
import play.api.Play.current


/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
class Users {
  def find(userId: String) {
    DB.withConnection(
      implicit c =>
        SQL("SELECT * FROM User u WHERE u.userId = {userId}")
          .on("userId" -> userId)()
          .map(row => (new User(row[Long]("id"), row[String]("userId"), row[String]("full_name"))))
          .toList

    )
  }

}
