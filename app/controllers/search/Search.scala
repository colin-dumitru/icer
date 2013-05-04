package controllers.search

import play.api.mvc.{PlainResult, Controller}
import play.api.libs.ws.{Response, WS}
import common.auth.Secured
import common.config.Global
import model.{Playlist, Song}
import scala.concurrent.{ExecutionContext, Await}
import scala.concurrent.duration._
import ExecutionContext.Implicits.global
import play.api.libs.json.JsArray
import java.net.URLEncoder

/**
 * Catalin Dumitru
 * Date: 5/3/13
 * Time: 10:04 PM
 */
object Search extends Controller {
  def section() = Secured {
    (req, userId) =>
      Ok(views.html.mobile.section_search(List() ++ Playlist.findAllForUser(userId)))
  }

  def search(query: String) = Secured {
    val encodedUrl = URLEncoder.encode(query, "UTF-8")
    val url = s"http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodedUrl}&api_key=${Global.lastFmApiKey}&format=json"

    val parsedResult = WS.url(url).get().map {
      response => this.parseSearchResult(response)
    }

    Await.result(parsedResult, 10 seconds)
  }

  private def parseSearchResult(response: Response): PlainResult = {
    val songs = (response.json \ "results" \ "trackmatches" \ "track").asOpt[JsArray] match {
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
    Ok(views.html.mobile.search(List() ++ songs))
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
}
