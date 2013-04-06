package service.search

import modelview.SearchSession
import scala.collection.mutable

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object SearchSessions {
  private val sessions = new mutable.HashMap[String, mutable.HashMap[String, SearchSession]]

  def get(userId: String, sessionId: String) {
    getUserSessions(userId)(sessionId)
  }

  def put(userId: String, session: SearchSession) {
    getUserSessions(userId) += session.sessionId.id -> session
  }


  def getUserSessions(userId: String): mutable.HashMap[String, SearchSession] = {

    if (sessions.contains(userId)) {
      sessions(userId)
    } else {
      val userSessions = new mutable.HashMap[String, SearchSession]
      sessions += userId -> userSessions
      userSessions
    }
  }
}
