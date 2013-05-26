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

  def findWeekPlays(userId: BigDecimal): List[(String, Long)] = {
    DB.withConnection {
      implicit connection =>
        val genres = SQL("select to_char(date_trunc('week', p.play_date), 'WW') as week, count(p.*) " +
          "from playback_history p where p.userid = {userId} group by date_trunc('week', p.play_date) order by week asc;").on(
          "userId" -> userId)
        genres().map(row => (row[String]("week"), row[Long]("count"))).toList
    }
  }

  def findGenres(userId: BigDecimal, week: String): List[(String, Long)] = {
    DB.withConnection {
      implicit connection =>
        val genres = SQL("select s.genre, COUNT(s.*) from songs s, playback_history p where p.song_id = s.mbid and " +
          "p.userid = {userId} and to_char(date_trunc('week', p.play_date), 'WW') = {week} " +
          "group by s.genre order by count(s.genre) desc limit 4;").on(
          "userId" -> userId,
          "week" -> week)
        genres().map(row => (row[String]("genre"), row[Long]("count"))).toList
    }
  }

  def findArtists(userId: BigDecimal, week: String): List[(String, Long)] = {
    DB.withConnection {
      implicit connection =>
        val artists = SQL("select s.artist, COUNT(s.*) from songs s, playback_history p where p.song_id = s.mbid and " +
          "p.userid = {userId} and to_char(date_trunc('week', p.play_date), 'WW') = {week} " +
          "group by s.artist order by count(s.artist) desc limit 4;").on(
          "userId" -> userId,
          "week" -> week)
        artists().map(row => (row[String]("artist"), row[Long]("count"))).toList
    }
  }
}
