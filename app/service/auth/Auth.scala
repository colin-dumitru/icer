package service.auth

import play.api.libs.json.JsValue
import play.api.libs.ws.{Response, WS}
import scala.util.{Success, Failure, Try}
import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
class Auth {

}

object Auth {
  var userInfo = mutable.Map[String, UserInfo]()

  def storeToken(jsValue: JsValue): Option[String] = {
    (jsValue \ "access_token").asOpt[String] match {
      case Some(token) => {
        WS.url("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token)
          .get().onComplete(storeUserInfo(token) _)
        Some[String](token)
      }
      case None => None
    }
  }

  def storeUserInfo(token: String)(result: Try[Response]) {
    result match {
      case Failure(_) => Unit
      case Success(body) => storeUserInfo(token, body.json)
    }
  }

  def storeUserInfo(token: String, jsValue: JsValue) {
    val user = UserInfo(
      token,
      (jsValue \ "id").asOpt[String] match {
        case Some(id) => BigDecimal(id)
        case None => null
      },
      (jsValue \ "name").asOpt[String] match {
        case Some(name) => name
        case None => null
      }
    )

    userInfo += token -> user
  }
}

case class UserInfo(toke: String, id: BigDecimal, name: String)
