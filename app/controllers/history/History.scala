package controllers.history

import common.auth.Secured
import play.api.mvc.Controller
import model.{PlaybackHistory, Song}
import java.util.Date
import service.song.SongInfoService
import modelview.HistoryModelView
import common.json.JsonJack._

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

  def getPlayback = Secured {
    (request, idUser) => {
      val result = PlaybackHistory.findWeekPlays(idUser)
      val weekPlays = result.map(p => new HistoryModelView(p._1.toString, p._2)).toArray
      Ok(generate(weekPlays)).as("application/json")
    }
  }

  def getGenres(week: Int) = Secured {
    (request, idUser) => {
      val result = PlaybackHistory.findGenres(idUser, (week + 1))
      val genres = result.map(p => new HistoryModelView(p._1, p._2)).toArray
      Ok(generate(genres)).as("application/json")
    }
  }

  def getArtists(week: Int) = Secured {
    (request, idUser) => {
      val result = PlaybackHistory.findArtists(idUser, (week + 1))
      val artists = result.map(p => new HistoryModelView(p._1, p._2)).toArray
      Ok(generate(artists)).as("application/json")
    }
  }

}
