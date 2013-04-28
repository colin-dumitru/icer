package controllers

import play.api.mvc._
import common.auth.Secured
import play.api.libs.openid.OpenID
import scala.util.Random
import java.security.MessageDigest
import service.auth.{UserInfo, Auth}
import play.api.libs.json
import scala.None
import play.api.libs.json.JsValue
import common.config.Global

object Application extends Controller {

  def index = Secured {
    (request, userId) =>
      Ok(views.html.main("Welcome to UPlay3D.", Auth.userInfo(request.session("access_token")).name,
        Global.soundCloudClientId, Global.lastFmApiKey))
  }


  def login() = Action {
    val token = MessageDigest.getInstance("MD5").digest(Random.nextString(10).getBytes).toString
    Ok(views.html.login(token)).withSession("token" -> token)
  }

  def storeToken() = Action {
    implicit request => {
      request.session.get("token") match {
        case Some(token) => checkAndStoreToken(request, token)
        case None => BadRequest("No client token is present!")
      }
    }
  }


  def checkAndStoreToken(request: Request[AnyContent], token: String): PlainResult = {
    request.body.asJson match {
      case Some(jsValue) =>
        (jsValue \ "token").asOpt[String] match {
          case Some(storedToken) => storeAccessToken(storedToken, token, jsValue)
          case None => BadRequest("Json is missing or malformed")
        }
      case None => BadRequest("Json is missing or malformed")
    }
  }


  def storeAccessToken(storedToken: String, token: String, jsValue: JsValue): PlainResult = {
    if (storedToken.trim == token.trim) {
      Ok("Token was stored")
        .withSession("access_token" -> (Auth.storeToken(jsValue) match {
        case Some(auth_token) => auth_token
        case None => null
      }))
    } else {
      BadRequest("Bad user token received: " + token + "/" + storedToken)
    }
  }

  def storeUserInfo = Action {
    implicit request =>
      OpenID.verifiedId.value match {
        case Some(res) => Ok("Logged IN")
        case None => Ok("Error")
      }
  }

  def loginComplete = Action {
    request =>
      request.session.get("access_token") match {
        case Some(token) =>
          Auth.userInfo.get(token) match {
            case Some(info) => done(info)
            case None => notDone
          }
        case None => notDone
      }
  }

  def done(info: UserInfo) = Ok(json.Json.toJson(Map("done" -> "true", "id" -> (Option(info.id) match {
    case Some(id) => id.toString()
    case None => null
  }))))

  def notDone = Ok(json.Json.toJson(Map("done" -> "false")))
}