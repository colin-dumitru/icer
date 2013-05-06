package controllers.chart

import play.api.mvc.Controller
import common.auth.Secured
import model.Song
import common.json.JsonJack._
import modelview.SongModelView

/**
 * Stefan Onofrei
 */

object Chart extends Controller {

  def generateChart(date: String, interval: String) = Secured {
    (request, idUser) => {
      val currentPlayback = Song.getSongsForChart(date, "0 day", interval)
      val previousPlayback = Song.getSongsForChart(date, interval, "0 day")
      val playbackView = currentPlayback.zipWithIndex.map(c => {
        var positionChange = 0

        val song = previousPlayback.filter(s => s.mbid.equals(c._1.mbid))
        if (song.isEmpty) {
          positionChange = 100 - c._2
        } else {
          positionChange = previousPlayback.indexOf(song.head) - c._2
        }

        new SongModelView(c._1.mbid, c._1.title, c._1.artist, c._1.album, c._1.genre, c._1.imageUrl, c._1.peek, c._1.weeksOnTop, positionChange)
      }).toArray
      Ok(generate(playbackView)).as("application/json")
    }
  }

}
