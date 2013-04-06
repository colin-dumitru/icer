package controllers

import play.api.mvc._

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object Search extends Controller {
  def search = Action {
    request => {
      request.session.get("userId").map {
        userId =>
          Ok("Hello " + user)
      }.getOrElse {
        Unauthorized("Oops, you are not connected")
      }
    }
  }

  def songs(sessionId: Integer, from: Integer, to: Integer) = Action {

  }

  def artists(sessionId: Integer, from: Integer, to: Integer) = Action {

  }

  def albums(sessionId: Integer, from: Integer, to: Integer) = Action {

  }

  def genre(sessionId: Integer, from: Integer, to: Integer) = Action {

  }

}
