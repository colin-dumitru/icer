package common.json

import java.lang.reflect.{Type, ParameterizedType}
import org.codehaus.jackson.map.ObjectMapper
import org.codehaus.jackson.`type`.TypeReference
import java.io.StringWriter

/**
 * Catalin Dumitru
 * Universitatea Alexandru Ioan Cuza
 */
object JsonJack {

  val mapper = new ObjectMapper()

  def generate(value: Any): String = {
    val writer = new StringWriter()
    mapper.writeValue(writer, value)
    writer.toString
  }

  def deserialize[T: Manifest](value: String): T =
    mapper.readValue(value, typeReference[T])

  private[this] def typeReference[T: Manifest] = new TypeReference[T] {
    override def getType = typeFromManifest(manifest[T])
  }

  private[this] def typeFromManifest(m: Manifest[_]): Type = {
    if (m.typeArguments.isEmpty) {
      m.erasure
    }
    else new ParameterizedType {
      def getRawType = m.erasure

      def getActualTypeArguments = m.typeArguments.map(typeFromManifest).toArray

      def getOwnerType = null
    }
  }


}
