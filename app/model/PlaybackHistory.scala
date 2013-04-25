package model

import java.util.Date
import anorm.SqlParser._
import anorm._
import play.api.db.DB
import anorm.~
import java.math.BigDecimal
import play.api.Play.current

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
case class PlaybackHistory(songId: String, userId: BigDecimal, playDate: Date) {

}

object PlaybackHistory {
  val simple = {
    get[String]("song_id") ~
      get[BigDecimal]("userid") ~
      get[Date]("play_date") map {
      case mbid ~ userid ~ playDate => PlaybackHistory(mbid, userid, playDate)
    }
  }

  def findAll(): Seq[PlaybackHistory] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from playback_history").as(PlaybackHistory.simple *)
    }
  }

  def save(history: PlaybackHistory) = {
    DB.withConnection {
      implicit connection =>
        SQL("insert into playback_history(song_id, userid, play_date) values ({song_id}, {userid}, {play_date})").on(
          "song_id" -> history.songId,
          "userid" -> history.userId,
          "play_date" -> history.playDate
        ).executeUpdate()
    }
  }
}
