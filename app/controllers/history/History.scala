package controllers.history

import common.auth.Secured
import play.api.mvc.Controller
import model.{PlaybackHistory, Song}
import java.util.Date
import service.song.SongInfoService

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object History extends Controller {
  def push = Secured {
    (req, userId) => {
      SongInfoService.loadInfo(Song(req.body.asJson.get), song => {
        Song.save(song)
        PlaybackHistory.save(PlaybackHistory(song.mbid, userId, new Date()))
      })
      Ok("History saved")
    }
  }

}
