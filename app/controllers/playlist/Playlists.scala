package controllers.playlist

import play.api.mvc.Controller
import common.auth.Secured
import common.json.JsonJack._
import model.{Song, Playlist}
import modelview.{SongModelView, PlaylistModelView}
import service.song.SongInfoService

/**
 * Irina Naum
 */
object Playlists extends Controller {

  def findAllForUser() = Secured {
    (request, idUser) => {
      val allPlaylists = Playlist.findAllForUser(idUser)
      val mvPlaylists = allPlaylists.map(p => new PlaylistModelView(p.id.toString, p.userid.toString, p.title)).toArray
      Ok(generate(mvPlaylists)).as("application/json")
    }
  }

  def createPlaylist(name: String) = Secured {
    (request, idUser) => {
      val newPlaylist = new Playlist(null, idUser, name)
      val mwPlaylist = new PlaylistModelView(Playlist.create(newPlaylist).toString(), idUser.toString(), name); //crw extra ";" and () for toString method
      Ok(generate(mwPlaylist)).as("application/json")
    }
  }

  def getSongsForPlaylist(idPlaylist: String) = Secured {
    (request, idUser) => {
      val songsForPlaylist = Song.getSongsForPlaylist(idPlaylist.toLong)
      val mwSongs = songsForPlaylist.map(song =>
        new SongModelView(song.mbid, song.title, song.artist, song.album, song.genre, song.imageUrl, song.peek, song.weeksOnTop, 0)).toArray
      Ok(generate(mwSongs)).as("application/json")

    }
  }

  def deleteSongFromPlaylist(idPlaylist: String, idSong: String) = Secured {
    (request, idUser) => {
      Playlist.deleteSongFromPlaylist(idPlaylist.toLong, idSong, idUser)
      Ok("Song deleted")
    }
  }

  def deletePlaylist(idPlaylist: String) = Secured {
    (request, idUser) => {
      Playlist.deletePlaylist(idPlaylist.toLong, idUser)
      Ok("Playlist deleted")
    }
  }

  def addSongToPlaylist(idPlaylist: String) = Secured {
    (request, userId) => {
      SongInfoService.loadInfo(Song(request.body.asJson.get), song => {
        Song.save(song)
        Playlist.addSongToPlaylist(idPlaylist.toLong, song.mbid, userId)
      })
      Ok("Song added")
    }
  }

  def section() = Secured {
    (request, userId) => {
      Ok(views.html.mobile.section_playlists(Playlist.findAllForUser(userId).toList))
    }
  }

  def playlist(id: String) = Secured {
    (request, userId) => {
      Ok(views.html.mobile.playlist(Song.getSongsForPlaylist(id.toLong).toList))
    }
  }

  def copyPlaylist(idPlaylist: String) = Secured {
    (request, userId) => {
      val playlistName = Playlist.getNameForPlaylist(idPlaylist.toLong);
      if (!playlistName.equals("No results found!")) {
        val newPlaylist = new Playlist(null, userId, playlistName);
        val id = Playlist.create(newPlaylist);
        var sqlStatement = "insert into playlist_song(id_playlist, id_song) values  "
        val songs = Song.getSongsForPlaylist(idPlaylist.toLong)
        songs match {
          case Nil => ;
          case songs => {
            songs foreach (song => sqlStatement = sqlStatement + " (" + id + ", '" + song.mbid + "'),");
            sqlStatement = sqlStatement.dropRight(1);
            Playlist.copySongsToPlaylist(sqlStatement, userId);
          }
        }
      }
      Redirect(controllers.routes.Application.index().url)
    }
  }

}