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

  def generateChart(startDate: String, endDate: String) = Secured {
    (request, idUser) => {
      val playback = Song.getSongsForChart(startDate, endDate)
      val playbackView = playback.map(p => new SongModelView(p.mbid, p.title, p.artist, p.album, p.genre, p.imageUrl, p.peek, p.weeksOnTop)).toArray
      Ok(generate(playbackView)).as("application/json")
    }
  }

}
