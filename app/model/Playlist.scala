package model

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import java.math.BigDecimal

//crw change template
/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/28/13
 * Time: 11:35 AM
 * To change this template use File | Settings | File Templates.
 */
//crw you do not need val for case classes as it infered by default, or "{..}" empty classes
case class Playlist(val id: Pk[Long], val userid: BigDecimal, val title: String) {
}

object Playlist {
  val simple = {
    get[Pk[Long]]("id") ~
      get[BigDecimal]("userid") ~
      get[String]("title") map {
      case id ~ userid ~ title => Playlist(id, userid, title)
    }
  }

  def findAllForUser(userId: BigDecimal): Seq[Playlist] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from playlists where userid = {userId}").on("userId" -> userId).as(Playlist.simple *)
    }
  }

  def find(id: BigDecimal): Option[Playlist] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from playlists where id = {id}").on("id" -> id).as(Playlist.simple *).headOption
    }
  }

  def create(playlist: Playlist): Pk[Long] = {
    DB.withConnection {
      implicit connection => {
        SQL("insert into playlists(userid,title) values ({userid},{title})").on(
          "userid" -> playlist.userid,
          "title" -> playlist.title
        ).executeInsert[Option[Long]]() match {
          case Some(id) => new Id[Long](id)
          case None => throw new IllegalArgumentException("Cannot add playlist")
        }
      }
    }
  }

  //crw check if the user who created the playlist is the one who deletes the song
  def deleteSongFromPlaylist(idPlaylist: Long, idSong: String) {
    DB.withConnection {
      implicit connection => {
        SQL("delete from playlist_song where id_playlist = {idPlaylist} and id_song = {idSong}").on(
          "idPlaylist" -> idPlaylist,
          "idSong" -> idSong
        ).executeUpdate()
      }
    }
  }

  def addSongToPlaylist(playlistId: Long, songId: String, userId: BigDecimal) {
    DB.withConnection {
      implicit connection => {
        SQL("insert into playlist_song(id_playlist, id_song) select {playlistId}, {songId} " +
          "where exists (select 1 from playlists pts where pts.userId = {userId})")
          .on("playlistId" -> playlistId)
          .on("songId" -> songId)
          .on("userId" -> userId).executeUpdate()
      }
    }
  }

  def deletePlaylist(idPlaylist: Long, userId: BigDecimal) {
    DB.withConnection {
      implicit connection => {
        SQL("delete from playlists where id = {idPlaylist} and userid = {userId}").on(
          "idPlaylist" -> idPlaylist,
          "userId" -> userId
        ).executeUpdate()
      }
    }
  }

  def getNameForPlaylist(idPlaylist: Long): String = {
    DB.withConnection {
      implicit connection =>
        val result = SQL("select * from playlists where id = {idPlaylist}").on("idPlaylist" -> idPlaylist).as(Playlist.simple *)
        result match {
          case List() => ""
          case result => result(0).title
        }

    }
  }

}