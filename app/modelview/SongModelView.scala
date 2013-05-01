package modelview

import scala.beans.BeanProperty

/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/30/13
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */
case class SongModelView(@BeanProperty val mbid: String, @BeanProperty val title: String, @BeanProperty val artist: String, @BeanProperty val album: String, @BeanProperty val genre: String) {
}
