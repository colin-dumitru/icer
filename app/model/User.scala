package model

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
case class User(id: Pk[Long], email: String) {
}

object User {
  val simple = {
    get[Pk[Long]]("id") ~
      get[String]("email") map {
      case id ~ email => User(id, email)
    }
  }

  def findAll(): Seq[User] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from users").as(User.simple *)
    }
  }

  def create(user: User) = {
    DB.withConnection {
      implicit connection =>
        SQL("insert into users(email) values ({email})").on(
          "email" -> user.email
        ).executeUpdate()
    }
  }


}
