package controllers

import play.api.mvc._
import common.auth.Secured
import play.api.libs.openid.OpenID
import scala.util.Random
import java.security.MessageDigest

object Application extends Controller {

  def index = Secured {
    Ok(views.html.index("Welcome to Uplay3D."))
  }


  def login() = Action {
    Ok(views.html.login())
  }

  def storeToken() = Action {
    implicit request => {
      val token = MessageDigest.getInstance("MD5").digest(Random.nextString(10).getBytes).toString
      Ok(token).withSession("tokern" -> token)
    }
  }

  def oauth2callback = Action {
    implicit request =>
      OpenID.verifiedId.value match {
        case Some(res) => Ok("Logged IN")
        case None => Ok("Error")
      }
  }
}