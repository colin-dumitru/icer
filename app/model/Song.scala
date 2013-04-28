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
case class Song(mbid: String, title: String, artist: String, album: String, genre: String) {
}

object Song {
  def apply(jsValue: JsValue): Song = {
    new Song(
      (jsValue \ "mbid").asOpt[String].get,
      (jsValue \ "info" \ "title").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "artist").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "album").asOpt[String].getOrElse(null),
      (jsValue \ "info" \ "genre").asOpt[String].getOrElse(null)
    )
  }

  val simple = {
    get[Pk[String]]("mbid") ~
      get[String]("title") ~
      get[String]("artist") ~
      get[String]("album") ~
      get[String]("genre") map {
      case mbid ~ title ~ artist ~ album ~ genre => Song(mbid.get, title, artist, album, genre)
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
        SQL("insert into songs(mbid, title, genre, album, artist) select {mbid}, {title}, {genre}, {album}, {artist} " +
          "where not exists (select 1 from songs where mbid = {mbid})").on(
          "mbid" -> song.mbid,
          "title" -> song.title,
          "genre" -> song.genre,
          "album" -> song.album,
          "artist" -> song.artist
        ).executeUpdate()
    }
  }
}