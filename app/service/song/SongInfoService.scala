package service.song

import model.Song
import play.api.libs.ws.WS
import common.config.Global
import scala.util.{Failure, Success}
import play.api.libs.json.JsValue
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Catalin Dumitru
 * Date: 5/2/13
 * Time: 11:21 AM
 */
object SongInfoService {
  def isMbid(idSong: String): Boolean = {
    idSong.length == 36
  }

  def loadInfo(song: Song, callback: (Song) => Unit) {
    if (isMbid(song.mbid))
      loadASync(song, callback)
    else
      callback(song)

  }

  private def loadASync(song: Song, callback: (Song) => Unit) {
    WS.url(s"http://ws.audioscrobbler.com/2.0/?method=track.getInfo" +
      s"&api_key=${Global.lastFmApiKey}&mbid=${song.mbid}&format=json").get().onComplete {
      case Success(req) => parseResponse(song, callback, req.json)
      case Failure(req) => callback(song)
    }
  }

  private def parseResponse(song: Song, callback: (Song) => Unit, json: JsValue) {
    callback(
      new Song(
        song.mbid,
        song.title,
        song.artist,
        (json \ "track" \ "album" \ "title").asOpt[String].getOrElse(null),
        ((json \ "track" \ "toptags" \ "tag")(0) \ "name").asOpt[String].getOrElse(null),
        song.imageUrl
      ))
  }


}
