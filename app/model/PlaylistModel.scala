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
case class PlaylistModel(val id: Pk[Long], val userid: BigDecimal, val title: String) {
}

//crw Model sufix is redundant as it is part of the model package
object PlaylistModel {
  val simple = {
    get[Pk[Long]]("id") ~
      get[BigDecimal]("userid") ~
      get[String]("title") map {
      case id ~ userid ~ title => PlaylistModel(id, userid, title)
    }
  }

  def findAllForUser(userId: BigDecimal): Seq[PlaylistModel] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from playlists where userid = {userId}").on("userId" -> userId).as(PlaylistModel.simple *)
    }
  }

  def create(playlist: PlaylistModel): Pk[Long] = {
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

  def deleteSongFromPlaylist(idPlaylist: Long, idSong: String) {
    DB.withConnection {
      implicit connection => {
        SQL("delete from playlist_song where id_playlist = {idPlaylist} and id_song = {idSong}").on(
          "idPlaylist" -> idPlaylist,
          "idSong" -> idSong
        ).executeUpdate();
      }
    }
  }

  def deletePlaylist(idPlaylist: Long, userId: BigDecimal) {
    DB.withConnection {
      implicit connection => {
        SQL("delete from playlists where id = {idPlaylist} and userid = {userId}").on(
          "idPlaylist" -> idPlaylist,
          "userId" -> userId
        ).executeUpdate();
      }
    }
  }

}