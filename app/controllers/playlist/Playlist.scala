package controllers.playlist

import play.api.mvc.Controller
import common.auth.Secured
import common.json.JsonJack._
import model.PlaylistModel
import modelview.PlaylistView

//crw template
/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/28/13
 * Time: 11:34 AM
 * To change this template use File | Settings | File Templates.
 */
object Playlist extends Controller {

  def findAllForUser() = Secured {
    (request, idUser) => {
      val allPlaylists = PlaylistModel.findAllForUser(idUser)
      val mvPlaylists = allPlaylists.map(p => new PlaylistView(p.id.toString, p.userid.toString, p.title)).toArray
      Ok(generate(mvPlaylists)).as("application/json")
    }
  }

  def createPlaylist(name: String) = Secured {
    (request, idUser) => {
      val newPlaylist = new PlaylistModel(null, idUser, name)
      val mwPlaylist = new PlaylistView(PlaylistModel.create(newPlaylist).toString, idUser.toString(), name); //crw extra ";" and () for toString method
      Ok(generate(mwPlaylist)).as("application/json")
    }
  }
}