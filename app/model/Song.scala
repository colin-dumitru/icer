package model

import anorm.SqlParser._
import anorm._
import play.api.db.DB
import anorm.~
import play.api.libs.json.JsValue
import play.api.Play.current

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
case class Song(mbid: String, title: String, artist: String, album: String, genre: String, imageUrl: String,
                peek: Long, weeksOnTop: Long) {
}

object Song {
  def apply(jsValue: JsValue): Song = {
    new Song(
      (jsValue \ "mbid").asOpt[String].get,
      (jsValue \ "info" \ "title").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "artist").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "album").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "genre").asOpt[String].getOrElse(null),
      (jsValue \ "imageUrl").asOpt[String].getOrElse(null),
      (jsValue \ "peek").asOpt[Long].getOrElse(0),
      (jsValue \ "weeksOnTop").asOpt[Long].getOrElse(0)
    )
  }

  val simple = {
    get[Pk[String]]("mbid") ~
      get[String]("title") ~
      get[String]("artist") ~
      get[Option[String]]("album") ~
      get[Option[String]]("genre") ~
      get[Option[String]]("imageurl") ~
      get[Option[Long]]("peek") ~
      get[Option[Long]]("weeks_on_top") map {
      case mbid ~ title ~ artist ~ album ~ genre ~ imageUrl ~ peek ~ weeksOnTop => Song(mbid.get, title, artist,
        album.getOrElse(null), genre.getOrElse(null), imageUrl.getOrElse(null), peek.getOrElse(0), weeksOnTop.getOrElse(0))
    }
  }

  def findAll(): Seq[Song] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from songs").as(Song.simple *)
    }
  }

  def save(song: Song) = {
    DB.withConnection {
      implicit connection =>
        SQL("insert into songs(mbid, title, genre, album, artist, imageurl, peek, weeks_on_top) " +
          "select {mbid}, {title}, {genre}, {album}, {artist}, {imageUrl}, {peek}, {weeksOnTop} " +
          "where not exists (select 1 from songs where mbid = {mbid})").on(
          "mbid" -> song.mbid,
          "title" -> song.title,
          "genre" -> song.genre,
          "album" -> song.album,
          "artist" -> song.artist,
          "imageUrl" -> song.imageUrl,
          "peek" -> song.peek,
          "weeksOnTop" -> song.weeksOnTop
        ).executeUpdate()
    }
  }

  def getSongsForPlaylist(idPlaylist: Long): Seq[Song] = {
    DB.withConnection {
      implicit connection =>
        SQL("select * from songs, playlist_song where songs.mbid = playlist_song.id_song and playlist_song.id_playlist = {idPlaylist}").on(
          "idPlaylist" -> idPlaylist).as(Song.simple *)
    }
  }

  def getSongsForChart(startDate: String, endDate: String): Seq[Song] = {
    DB.withConnection {
      implicit connection =>
        SQL("select s.* from playback_history p, songs s " +
          "where s.mbid = p.song_id and p.play_date >= {startDate}::date and p.play_date <= {endDate}::date " +
          "group by s.mbid order by count(p.*) desc limit 100;").on(
          "startDate" -> startDate,
          "endDate" -> endDate).as(Song.simple *)
    }
  }
}
