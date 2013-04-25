package controllers.history

import common.auth.Secured
import play.api.mvc.Controller
import model.{PlaybackHistory, Song}
import java.util.Date

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object History extends Controller {
  def push = Secured {
    (req, userId) => {
      val song = Song(req.body.asJson.get)
      Song.save(song)
      PlaybackHistory.save(PlaybackHistory(song.mbid, userId, new Date()))
      Ok("History saved")
    }
  }

}
