package modelview

import scala.beans.BeanProperty

/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/28/13
 * Time: 11:39 AM
 * To change this template use File | Settings | File Templates.
 */
case class PlaylistView(@BeanProperty var id: String, @BeanProperty var idUser: String, @BeanProperty var name: String) {

}
