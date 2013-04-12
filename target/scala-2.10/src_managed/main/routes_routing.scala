// @SOURCE:E:/Work/Scala/icer/conf/routes
// @HASH:1e4067bd916c94ab36bfccd7ca23eb70ca89a603
// @DATE:Fri Apr 12 09:14:58 EEST 2013


import play.core._
import play.core.Router._
import play.core.j._

import play.api.mvc._


import Router.queryString

object Routes extends Router.Routes {

private var _prefix = "/"

def setPrefix(prefix: String) {
  _prefix = prefix  
  List[(String,Routes)]().foreach {
    case (p, router) => router.setPrefix(prefix + (if(prefix.endsWith("/")) "" else "/") + p)
  }
}

def prefix = _prefix

lazy val defaultPrefix = { if(Routes.prefix.endsWith("/")) "" else "/" } 


// @LINE:6
private[this] lazy val controllers_Application_index0 = Route("GET", PathPattern(List(StaticPart(Routes.prefix))))
        

// @LINE:9
private[this] lazy val controllers_Assets_at1 = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("assets/"),DynamicPart("file", """.+"""))))
        

// @LINE:12
private[this] lazy val controllers_Search_search2 = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("search/new"))))
        

// @LINE:13
private[this] lazy val controllers_Search_songs3 = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("search/songs/"),DynamicPart("sessionId", """[^/]+"""),StaticPart("/"),DynamicPart("from", """[^/]+"""),StaticPart("/"),DynamicPart("to", """[^/]+"""))))
        

// @LINE:14
private[this] lazy val controllers_Search_artists4 = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("search/arists/"),DynamicPart("sessionId", """[^/]+"""),StaticPart("/"),DynamicPart("from", """[^/]+"""),StaticPart("/"),DynamicPart("to", """[^/]+"""))))
        

// @LINE:15
private[this] lazy val controllers_Search_genre5 = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("search/genre/"),DynamicPart("sessionId", """[^/]+"""),StaticPart("/"),DynamicPart("from", """[^/]+"""),StaticPart("/"),DynamicPart("to", """[^/]+"""))))
        

// @LINE:16
private[this] lazy val controllers_Search_albums6 = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("search/albums/"),DynamicPart("sessionId", """[^/]+"""),StaticPart("/"),DynamicPart("from", """[^/]+"""),StaticPart("/"),DynamicPart("to", """[^/]+"""))))
        
def documentation = List(("""GET""", prefix,"""controllers.Application.index"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """assets/$file<.+>""","""controllers.Assets.at(path:String = "/public", file:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """search/new""","""controllers.Search.search(query:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """search/songs/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""","""controllers.Search.songs(sessionId:Long, from:Long, to:Long)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """search/arists/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""","""controllers.Search.artists(sessionId:Long, from:Long, to:Long)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """search/genre/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""","""controllers.Search.genre(sessionId:Long, from:Long, to:Long)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """search/albums/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>""","""controllers.Search.albums(sessionId:Long, from:Long, to:Long)""")).foldLeft(List.empty[(String,String,String)]) { (s,e) => e match {
  case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
  case l => s ++ l.asInstanceOf[List[(String,String,String)]] 
}}
       
    
def routes:PartialFunction[RequestHeader,Handler] = {        

// @LINE:6
case controllers_Application_index0(params) => {
   call { 
        invokeHandler(controllers.Application.index, HandlerDef(this, "controllers.Application", "index", Nil,"GET", """ Home page""", Routes.prefix + """"""))
   }
}
        

// @LINE:9
case controllers_Assets_at1(params) => {
   call(Param[String]("path", Right("/public")), params.fromPath[String]("file", None)) { (path, file) =>
        invokeHandler(controllers.Assets.at(path, file), HandlerDef(this, "controllers.Assets", "at", Seq(classOf[String], classOf[String]),"GET", """ Map static resources from the /public folder to the /assets URL path""", Routes.prefix + """assets/$file<.+>"""))
   }
}
        

// @LINE:12
case controllers_Search_search2(params) => {
   call(params.fromQuery[String]("query", None)) { (query) =>
        invokeHandler(controllers.Search.search(query), HandlerDef(this, "controllers.Search", "search", Seq(classOf[String]),"POST", """Search""", Routes.prefix + """search/new"""))
   }
}
        

// @LINE:13
case controllers_Search_songs3(params) => {
   call(params.fromPath[Long]("sessionId", None), params.fromPath[Long]("from", None), params.fromPath[Long]("to", None)) { (sessionId, from, to) =>
        invokeHandler(controllers.Search.songs(sessionId, from, to), HandlerDef(this, "controllers.Search", "songs", Seq(classOf[Long], classOf[Long], classOf[Long]),"POST", """""", Routes.prefix + """search/songs/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>"""))
   }
}
        

// @LINE:14
case controllers_Search_artists4(params) => {
   call(params.fromPath[Long]("sessionId", None), params.fromPath[Long]("from", None), params.fromPath[Long]("to", None)) { (sessionId, from, to) =>
        invokeHandler(controllers.Search.artists(sessionId, from, to), HandlerDef(this, "controllers.Search", "artists", Seq(classOf[Long], classOf[Long], classOf[Long]),"POST", """""", Routes.prefix + """search/arists/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>"""))
   }
}
        

// @LINE:15
case controllers_Search_genre5(params) => {
   call(params.fromPath[Long]("sessionId", None), params.fromPath[Long]("from", None), params.fromPath[Long]("to", None)) { (sessionId, from, to) =>
        invokeHandler(controllers.Search.genre(sessionId, from, to), HandlerDef(this, "controllers.Search", "genre", Seq(classOf[Long], classOf[Long], classOf[Long]),"POST", """""", Routes.prefix + """search/genre/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>"""))
   }
}
        

// @LINE:16
case controllers_Search_albums6(params) => {
   call(params.fromPath[Long]("sessionId", None), params.fromPath[Long]("from", None), params.fromPath[Long]("to", None)) { (sessionId, from, to) =>
        invokeHandler(controllers.Search.albums(sessionId, from, to), HandlerDef(this, "controllers.Search", "albums", Seq(classOf[Long], classOf[Long], classOf[Long]),"POST", """""", Routes.prefix + """search/albums/$sessionId<[^/]+>/$from<[^/]+>/$to<[^/]+>"""))
   }
}
        
}
    
}
        