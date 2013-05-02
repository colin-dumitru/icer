package controllers.playlist

import play.api.mvc.Controller
import common.auth.Secured
import common.json.JsonJack._
import model.{Song, PlaylistModel}
import modelview.{SongModelView, PlaylistModelView}

//crw template
/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/28/13
 * Time: 11:34 AM
 * To change this template use File | Settings | File Templates.
 */
object Playlist extends Controller {

  def findAllForUser() = Secured {
    (request, idUser) => {
      val allPlaylists = PlaylistModel.findAllForUser(idUser)
      val mvPlaylists = allPlaylists.map(p => new PlaylistModelView(p.id.toString, p.userid.toString, p.title)).toArray
      Ok(generate(mvPlaylists)).as("application/json")
    }
  }

  def createPlaylist(name: String) = Secured {
    (request, idUser) => {
      val newPlaylist = new PlaylistModel(null, idUser, name)
      val mwPlaylist = new PlaylistModelView(PlaylistModel.create(newPlaylist).toString(), idUser.toString(), name); //crw extra ";" and () for toString method
      Ok(generate(mwPlaylist)).as("application/json")
    }
  }

  def getSongsForPlaylist(idPlaylist: String) = Secured {
    (request, idUser) => {
      val songsForPlaylist = Song.getSongsForPlaylist(idPlaylist.toLong)
      val mwSongs = songsForPlaylist.map(song => new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }

  def deleteSongFromPlaylist(idPlaylist: String, idSong: String) = Secured {
    (request, idUser) => {
      PlaylistModel.deleteSongFromPlaylist(idPlaylist.toLong, idSong)
      Ok("Song deleted")

    }
  }

  def deletePlaylist(idPlaylist: String) = Secured {
    (request, idUser) => {
      PlaylistModel.deletePlaylist(idPlaylist.toLong, idUser)
      Ok("Playlist deleted")
    }
  }

  def addSongToPlaylist(idPlaylist: String, issong: String) = Secured {
    (request, userId) => {
      Ok("")
    }
  }


}