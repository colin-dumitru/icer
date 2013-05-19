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


  def getRecentSongs() = Secured {
    (request, idUser) => {
      val songsForHistory = Song.getRecentSongs(idUser)
      val mwSongs = songsForHistory.map(song => new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre, song.imageUrl, song.peek, song.weeksOnTop, 0)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }

  def getSongsFromRecentGenres() = Secured {
    (request, idUser) => {
      val songsForGenre = Song.getSongsFromRecentGenres(idUser)
      val mwSongs = songsForGenre.map(song => new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre, song.imageUrl, song.peek, song.weeksOnTop, 0)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }

  def getSongsFromRecentAlbums() = Secured {
    (request, idUser) => {
      val songsForAlbum = Song.getSongsFromRecentAlbums(idUser)
      val mwSongs = songsForAlbum.map(song => new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre, song.imageUrl, song.peek, song.weeksOnTop, 0)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }

}
