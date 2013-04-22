package common.auth

import play.api.mvc._
import controllers.routes
import Results._
import service.auth.Auth
import java.math.BigDecimal

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */

object Secured {
  def apply(block: (Request[AnyContent], BigDecimal) => Result): Action[AnyContent] = {
    Action(request => {
      request.session.get("access_token") match {
        case Some(token) => {
          Auth.userInfo.get(token) match {
            case Some(info) => if (info.id == null) toLogIn else block(request, info.id)
            case None => toLogIn
          }
        }
        case None => toLogIn
      }
    })
  }

  def toLogIn: SimpleResult[EmptyContent] = {
    Redirect(routes.Application.login().url)
  }

  def apply(result: PlainResult): Action[AnyContent] = {
    Secured((req, id) => result)
  }
}
