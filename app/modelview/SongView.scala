package modelview

import scala.beans.BeanProperty

/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/30/13
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */
case class SongView(@BeanProperty var mbid: String, @BeanProperty var title: String, @BeanProperty var artist: String, @BeanProperty var album: String, @BeanProperty var genre: String) {
}
