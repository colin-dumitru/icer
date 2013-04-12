// @SOURCE:E:/Work/Scala/icer/conf/routes
// @HASH:1e4067bd916c94ab36bfccd7ca23eb70ca89a603
// @DATE:Fri Apr 12 09:14:58 EEST 2013

import Routes.{prefix => _prefix, defaultPrefix => _defaultPrefix}
import play.core._
import play.core.Router._
import play.core.j._

import play.api.mvc._


import Router.queryString


// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
// @LINE:9
// @LINE:6
package controllers {

// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
class ReverseSearch {
    

// @LINE:13
def songs(sessionId:Long, from:Long, to:Long): Call = {
   Call("POST", _prefix + { _defaultPrefix } + "search/songs/" + implicitly[PathBindable[Long]].unbind("sessionId", sessionId) + "/" + implicitly[PathBindable[Long]].unbind("from", from) + "/" + implicitly[PathBindable[Long]].unbind("to", to))
}
                                                

// @LINE:14
def artists(sessionId:Long, from:Long, to:Long): Call = {
   Call("POST", _prefix + { _defaultPrefix } + "search/arists/" + implicitly[PathBindable[Long]].unbind("sessionId", sessionId) + "/" + implicitly[PathBindable[Long]].unbind("from", from) + "/" + implicitly[PathBindable[Long]].unbind("to", to))
}
                                                

// @LINE:16
def albums(sessionId:Long, from:Long, to:Long): Call = {
   Call("POST", _prefix + { _defaultPrefix } + "search/albums/" + implicitly[PathBindable[Long]].unbind("sessionId", sessionId) + "/" + implicitly[PathBindable[Long]].unbind("from", from) + "/" + implicitly[PathBindable[Long]].unbind("to", to))
}
                                                

// @LINE:15
def genre(sessionId:Long, from:Long, to:Long): Call = {
   Call("POST", _prefix + { _defaultPrefix } + "search/genre/" + implicitly[PathBindable[Long]].unbind("sessionId", sessionId) + "/" + implicitly[PathBindable[Long]].unbind("from", from) + "/" + implicitly[PathBindable[Long]].unbind("to", to))
}
                                                

// @LINE:12
def search(query:String): Call = {
   Call("POST", _prefix + { _defaultPrefix } + "search/new" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("query", query)))))
}
                                                
    
}
                          

// @LINE:6
class ReverseApplication {
    

// @LINE:6
def index(): Call = {
   Call("GET", _prefix)
}
                                                
    
}
                          

// @LINE:9
class ReverseAssets {
    

// @LINE:9
def at(file:String): Call = {
   Call("GET", _prefix + { _defaultPrefix } + "assets/" + implicitly[PathBindable[String]].unbind("file", file))
}
                                                
    
}
                          
}
                  


// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
// @LINE:9
// @LINE:6
package controllers.javascript {

// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
class ReverseSearch {
    

// @LINE:13
def songs : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Search.songs",
   """
      function(sessionId,from,to) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "search/songs/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("sessionId", sessionId) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("from", from) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("to", to)})
      }
   """
)
                        

// @LINE:14
def artists : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Search.artists",
   """
      function(sessionId,from,to) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "search/arists/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("sessionId", sessionId) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("from", from) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("to", to)})
      }
   """
)
                        

// @LINE:16
def albums : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Search.albums",
   """
      function(sessionId,from,to) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "search/albums/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("sessionId", sessionId) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("from", from) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("to", to)})
      }
   """
)
                        

// @LINE:15
def genre : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Search.genre",
   """
      function(sessionId,from,to) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "search/genre/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("sessionId", sessionId) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("from", from) + "/" + (""" + implicitly[PathBindable[Long]].javascriptUnbind + """)("to", to)})
      }
   """
)
                        

// @LINE:12
def search : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Search.search",
   """
      function(query) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "search/new" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("query", query)])})
      }
   """
)
                        
    
}
              

// @LINE:6
class ReverseApplication {
    

// @LINE:6
def index : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Application.index",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + """"})
      }
   """
)
                        
    
}
              

// @LINE:9
class ReverseAssets {
    

// @LINE:9
def at : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Assets.at",
   """
      function(file) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "assets/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("file", file)})
      }
   """
)
                        
    
}
              
}
        


// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
// @LINE:9
// @LINE:6
package controllers.ref {

// @LINE:16
// @LINE:15
// @LINE:14
// @LINE:13
// @LINE:12
class ReverseSearch {
    

// @LINE:13
def songs(sessionId:Long, from:Long, to:Long): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Search.songs(sessionId, from, to), HandlerDef(this, "controllers.Search", "songs", Seq(classOf[Long], classOf[Long], classOf[Long]), "POST", """""", _prefix + """search/songs/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""")
)
                      

// @LINE:14
def artists(sessionId:Long, from:Long, to:Long): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Search.artists(sessionId, from, to), HandlerDef(this, "controllers.Search", "artists", Seq(classOf[Long], classOf[Long], classOf[Long]), "POST", """""", _prefix + """search/arists/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""")
)
                      

// @LINE:16
def albums(sessionId:Long, from:Long, to:Long): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Search.albums(sessionId, from, to), HandlerDef(this, "controllers.Search", "albums", Seq(classOf[Long], classOf[Long], classOf[Long]), "POST", """""", _prefix + """search/albums/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""")
)
                      

// @LINE:15
def genre(sessionId:Long, from:Long, to:Long): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Search.genre(sessionId, from, to), HandlerDef(this, "controllers.Search", "genre", Seq(classOf[Long], classOf[Long], classOf[Long]), "POST", """""", _prefix + """search/genre/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""")
)
                      

// @LINE:12
def search(query:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Search.search(query), HandlerDef(this, "controllers.Search", "search", Seq(classOf[String]), "POST", """Search""", _prefix + """search/new""")
)
                      
    
}
                          

// @LINE:6
class ReverseApplication {
    

// @LINE:6
def index(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Application.index(), HandlerDef(this, "controllers.Application", "index", Seq(), "GET", """ Home page""", _prefix + """""")
)
                      
    
}
                          

// @LINE:9
class ReverseAssets {
    

// @LINE:9
def at(path:String, file:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Assets.at(path, file), HandlerDef(this, "controllers.Assets", "at", Seq(classOf[String], classOf[String]), "GET", """ Map static resources from the /public folder to the /assets URL path""", _prefix + """assets/$file<.+>""")
)
                      
    
}
                          
}
                  
      