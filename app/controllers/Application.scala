package controllers

import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Welcome to Uplay3D."))
      .withSession("userId" -> "catalin")
  }

}