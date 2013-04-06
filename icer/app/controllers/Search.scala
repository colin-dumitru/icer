package controllers

import play.api.mvc._
import common.json.JsonJack._
import service.search.{SearchService, SearchSessions}

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object Search extends Controller {
  def search(query: String) = Action {
    request => {
      filterAccess(request, userId => {
        val tmpSession = SearchService.search(query)
        SearchSessions.put(userId, tmpSession)
        Ok(generate(tmpSession)).as("application/json")
      })
    }
  }

  def songs(sessionId: Long, from: Long, to: Long) = Action {
    request => {
      filterAccess(request, userId => {
        Ok(generate(List())).as("application/json")
      })
    }
  }

  def artists(sessionId: Long, from: Long, to: Long) = Action {
    request => {
      filterAccess(request, userId => {
        Ok(generate(List())).as("application/json")
      })
    }
  }

  def albums(sessionId: Long, from: Long, to: Long) = Action {
    request => {
      filterAccess(request, userId => {
        Ok(generate(List())).as("application/json")
      })
    }
  }

  def genre(sessionId: Long, from: Long, to: Long) = Action {
    request => {
      filterAccess(request, userId => {
        Ok(generate(List())).as("application/json")
      })
    }
  }

  def filterAccess(request: Request[AnyContent], method: (String) => Result): Result = {
    request.session.get("userId").map {
      userId => {
        method(userId)
      }
    }.getOrElse {
      Unauthorized("Oops, you are not connected")
    }
  }

}
