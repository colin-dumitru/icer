package service.search

import modelview.{Song, SearchResult, SearchSessionId, SearchSession}
import java.util.UUID

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object SearchService {
  def search(query: String): SearchSession = {
    val results = new SearchResult(mockSongs, mockSongs, mockSongs, mockSongs)
    new SearchSession(new SearchSessionId(UUID.randomUUID.toString, query), results)
  }

  private def mockSongs = {
    Range(1, 50).map(x => {
      new Song("songId", "", "Ships in the night", "Mat Kearney")
    }).toList
  }

}
