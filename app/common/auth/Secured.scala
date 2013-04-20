package common.auth

import play.api.mvc._
import controllers.routes
import Results._

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */

object Secured {
  def apply(block: (Request[AnyContent]) => Result): Action[AnyContent] = {
    Action(request => {
      request.session.get("userId") match {
        case Some(userId) => block(request)
        case None => Redirect(routes.Application.login().url)
      }
    })
  }

  def apply(result: PlainResult): Action[AnyContent] = {
    Action(request => {
      request.session.get("userId") match {
        case Some(userId) => result
        case None => Redirect(routes.Application.login().url)
      }
    })
  }
}
