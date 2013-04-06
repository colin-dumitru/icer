package modelview

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
case class SearchSession(id: String, title: String, result: SearchResult) {
}

case class SearchResult(similarWithSong: List[Song], similarWithArtist: List[Song], similarWithGenre: List[Song],
                        similarWithAlbum: List[Song]) {
}
