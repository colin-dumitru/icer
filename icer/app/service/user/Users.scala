package service.user

import anorm._
import model.User

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
class Users {
  def find(userId: String) {
    SQL("SELECT * FROM User u WHERE u.userId = {userId}")
      .on("userId" -> userId)()
      .map(row => new User(row("id"), row("userId"), row("name")))
  }

}
