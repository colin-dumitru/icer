
package views.html

import play.templates._
import play.templates.TemplateMagic._

import play.api.templates._
import play.api.templates.PlayMagic._
import models._
import controllers._
import play.api.i18n._
import play.api.mvc._
import play.api.data._
import views.html._
/**/
object index extends BaseScalaTemplate[play.api.templates.Html,Format[play.api.templates.Html]](play.api.templates.HtmlFormat) with play.api.templates.Template1[String,play.api.templates.Html] {

    /**/
    def apply/*1.2*/(message: String):play.api.templates.Html = {
        _display_ {

Seq[Any](format.raw/*1.19*/("""

"""),_display_(Seq[Any](/*3.2*/main("Welcome to Uplay3D")/*3.28*/ {_display_(Seq[Any](format.raw/*3.30*/("""
    Halo
""")))})),format.raw/*5.2*/("""
"""))}
    }
    
    def render(message:String): play.api.templates.Html = apply(message)
    
    def f:((String) => play.api.templates.Html) = (message) => apply(message)
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Fri Apr 12 09:15:00 EEST 2013
                    SOURCE: E:/Work/Scala/icer/app/views/index.scala.html
                    HASH: 4f4bcc89d0d2ef9341adf7e72f4a8e177fbd67af
                    MATRIX: 505->1|599->18|638->23|672->49|711->51|754->64
                    LINES: 19->1|22->1|24->3|24->3|24->3|26->5
                    -- GENERATED --
                */
            