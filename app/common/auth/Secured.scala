package common.auth

import play.api.mvc._

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */

object Secured {
  def apply(block: (Request[AnyContent]) => Result): Action[AnyContent] = {
    Action(request => {
      //todo actual authentication code
      block(request)
    })
  }

  def apply(result: PlainResult): Action[AnyContent] = {
    Action(request => {
      //todo actual authentication code
      result
    })
  }
}
