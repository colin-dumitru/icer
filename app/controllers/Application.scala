package controllers

import play.api.mvc._
import common.auth.Secured
import model.User

object Application extends Controller {

  def index = Action {
    User.findAll()
    Ok(views.html.index("Welcome to Uplay3D."))
      .withSession("userId" -> "catalin")
  }

  def index2 = Secured {
    Ok(views.html.index("Welcome to Uplay3D."))
      .withSession("userId" -> "catalin")
  }

}