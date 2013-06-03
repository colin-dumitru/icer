package controllers.radio

import play.api.mvc.Controller
import common.auth.Secured
import common.json.JsonJack._
import java.math.BigDecimal
import model.Song
import modelview.SongModelView

/**
 * Created with IntelliJ IDEA.
 * User: Sabina
 * Date: 5/19/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */
object Radio extends Controller{


  def section() = Secured {
    (req, userId) =>
      Ok(views.html.mobile.section_radio())
  }

  def getRecentSongs() = Secured {
    (request, idUser) => {
      val songsForHistory = Song.getRecentSongs(idUser)
      val mwSongs = songsForHistory.map(song => new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre, song.imageUrl, song.peek, song.weeksOnTop, 0)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }


}
