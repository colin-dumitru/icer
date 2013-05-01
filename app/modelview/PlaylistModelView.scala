package modelview

import scala.beans.BeanProperty

/**
 * Created with IntelliJ IDEA.
 * User: Irina
 * Date: 4/28/13
 * Time: 11:39 AM
 * To change this template use File | Settings | File Templates.
 */
//crw View means a... view. This is a model-view. Change the suffix to make it less confusing.
case class PlaylistModelView(@BeanProperty val id: String, @BeanProperty val idUser: String, @BeanProperty val name: String) {

}
