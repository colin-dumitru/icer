package controllers.radio

import play.api.mvc.Controller
import common.auth.Secured
import common.json.JsonJack._
import model.Song
import modelview.SongModelView
import play.api.libs.json.JsArray
import play.api.libs.ws.{WS, Response}
import java.net.URLEncoder
import common.config.Global
import scala.concurrent.{ExecutionContext, Await}
import scala.concurrent.duration._
import ExecutionContext.Implicits.global

/**
 * Sabina Macarie
 */
object Radio extends Controller {


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

  def buildRadio() = Secured {
    (request, userId) => {
      val criteria = request.body.asJson.getOrElse(new JsArray()).as[JsArray].value.map(item => {
        ((item \ "id").asOpt[String].getOrElse(""), (item \ "content").asOpt[String].getOrElse(""))
      })
      val recentSongs = Song.getRecentSongs(userId)
      val songs = criteria.flatMap(item => item match {
        case ("custom", content) => buildCustomSongs(content)
        case ("recent_songs", content) => buildRecentSongs(content, recentSongs)
        case ("recent_albums", content) => buildRecentAlbumSongs(content, recentSongs)
        case ("recent_genres", content) => buildRecentGenreSongs(content, recentSongs)
      })
      Ok(generate(mapSongsToModelView(songs).toArray))
    }
  }

  private def mapSongsToModelView(songs: Seq[Song]): Seq[SongModelView] = {
    songs.map(s => SongModelView(s.mbid, s.title, s.artist, s.album, s.genre, s.imageUrl, s.peek, s.weeksOnTop, 0))
  }

  private def buildCustomSongs(criteria: String): Seq[Song] = {
    val encodedUrl = URLEncoder.encode(criteria, "UTF-8")
    val url = s"http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodedUrl}&api_key=${Global.lastFmApiKey}&format=json&limit=15"

    val parsedResult = WS.url(url).get().map {
      response => this.parseSearchResult(response)
    }

    Await.result(parsedResult, 10 seconds)
  }

  private def parseSearchResult(response: Response): Seq[Song] = {
    (response.json \ "results" \ "trackmatches" \ "track").asOpt[JsArray] match {
      case Some(tracks) => tracks.as[JsArray].value.map(track => {
        new Song(
          (track \ "mbid").asOpt[String].getOrElse(null),
          (track \ "name").asOpt[String].getOrElse(null),
          (track \ "artist").asOpt[String].getOrElse(null),
          null,
          null,
          getLargeImage((track \ "image").asOpt[JsArray]),
          0,
          0
        )
      })
      case _ => List()
    }
  }

  private def getLargeImage(imageArray: Option[JsArray]): String = imageArray match {
    case Some(array) => {
      val extraLargeImage = array.value filter {
        (v) => (v \ "size").as[String] == "large"
      }

      extraLargeImage.headOption match {
        case Some(v) => (v \ "#text").as[String]
        case _ => "/assets/images/logo.gif"
      }
    }
    case None => "/assets/images/logo.gif"
  }

  private def buildRecentSongs(criteria: String, recentSongs: Seq[Song]): Seq[Song] = {
    recentSongs.flatMap(song => {
      val artist = URLEncoder.encode(song.artist, "UTF-8")
      val title = URLEncoder.encode(song.title, "UTF-8")
      val url = s"http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${artist}&track=${title}&api_key=${Global.lastFmApiKey}&format=json&limit=5"

      val parsedResult = WS.url(url).get().map {
        response => this.parseSimilarResult(response)
      }

      Await.result(parsedResult, 10 seconds)
    })
  }

  private def parseSimilarResult(response: Response): Seq[Song] = {
    (response.json \ "similartracks" \ "track").asOpt[JsArray] match {
      case Some(tracks) => tracks.as[JsArray].value.map(track => {
        new Song(
          (track \ "mbid").asOpt[String].getOrElse(null),
          (track \ "name").asOpt[String].getOrElse(null),
          (track \ "artist" \ "name").asOpt[String].getOrElse(null),
          null,
          null,
          getLargeImage((track \ "image").asOpt[JsArray]),
          0,
          0
        )
      })
      case _ => List()
    }
  }

  private def buildRecentAlbumSongs(criteria: String, recentSongs: Seq[Song]): Seq[Song] = {
    recentSongs.flatMap(song => {
      val artist = URLEncoder.encode(song.artist, "UTF-8")
      val title = URLEncoder.encode(song.album, "UTF-8")
      val url = s"http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${Global.lastFmApiKey}&artist=${artist}&album=${title}&format=json"

      val parsedResult = WS.url(url).get().map {
        response => this.parseAlbumResult(response)
      }

      Await.result(parsedResult, 10 seconds)
    })
  }

  private def parseAlbumResult(response: Response): Seq[Song] = {
    (response.json \ "album" \ "tracks" \ "track").asOpt[JsArray] match {
      case Some(tracks) => tracks.as[JsArray].value.map(track => {
        new Song(
          (track \ "mbid").asOpt[String].getOrElse(null),
          (track \ "name").asOpt[String].getOrElse(null),
          (track \ "artist" \ "name").asOpt[String].getOrElse(null),
          null,
          null,
          getLargeImage((track \ "image").asOpt[JsArray]),
          0,
          0
        )
      })
      case _ => List()
    }
  }

  private def buildRecentGenreSongs(criteria: String, recentSongs: Seq[Song]): Seq[Song] = {
    recentSongs.flatMap(song => {
      val tag = URLEncoder.encode(song.genre, "UTF-8")
      val url = s"http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${tag}&api_key=${Global.lastFmApiKey}&format=json&limit=5"

      val parsedResult = WS.url(url).get().map {
        response => this.parseGenreResult(response)
      }

      Await.result(parsedResult, 10 seconds)
    })
  }

  private def parseGenreResult(response: Response): Seq[Song] = {
    (response.json \ "toptracks" \ "track").asOpt[JsArray] match {
      case Some(tracks) => tracks.as[JsArray].value.map(track => {
        new Song(
          (track \ "mbid").asOpt[String].getOrElse(null),
          (track \ "name").asOpt[String].getOrElse(null),
          (track \ "artist" \ "name").asOpt[String].getOrElse(null),
          null,
          null,
          getLargeImage((track \ "image").asOpt[JsArray]),
          0,
          0
        )
      })
      case _ => List()
    }
  }

}
