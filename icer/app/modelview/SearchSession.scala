package modelview

import scala.beans.BeanProperty


/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
case class SearchSession(@BeanProperty var sessionId: SearchSessionId, @BeanProperty var result: SearchResult)

case class SearchSessionId(@BeanProperty var id: String, @BeanProperty var title: String)

case class SearchResult(@BeanProperty var similarWithSong: List[Song], @BeanProperty var similarWithArtist: List[Song],
                        @BeanProperty var similarWithGenre: List[Song], @BeanProperty var similarWithAlbum: List[Song])
