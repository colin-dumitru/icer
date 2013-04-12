
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
object main extends BaseScalaTemplate[play.api.templates.Html,Format[play.api.templates.Html]](play.api.templates.HtmlFormat) with play.api.templates.Template2[String,Html,play.api.templates.Html] {

    /**/
    def apply/*1.2*/(title: String)(content: Html):play.api.templates.Html = {
        _display_ {

Seq[Any](format.raw/*1.32*/("""

<!DOCTYPE html>

<html>
<head>
    <title> """),_display_(Seq[Any](/*7.14*/title)),format.raw/*7.19*/(""" </title>

    <link href='http://fonts.googleapis.com/css?family=Days+One' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Noto+Sans' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css" />

    <link rel="stylesheet" media="screen" href=""""),_display_(Seq[Any](/*15.50*/routes/*15.56*/.Assets.at("stylesheets/main.css"))),format.raw/*15.90*/("""">
    <link rel="shortcut icon" type="image/png" href=""""),_display_(Seq[Any](/*16.55*/routes/*16.61*/.Assets.at("images/favicon.png"))),format.raw/*16.93*/("""">

    <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    <script src="http://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
    <script src=""""),_display_(Seq[Any](/*20.19*/routes/*20.25*/.Assets.at("javascripts/rickshaw.min.js"))),format.raw/*20.66*/(""""></script>
    <script src=""""),_display_(Seq[Any](/*21.19*/routes/*21.25*/.Assets.at("javascripts/d3.v2.js"))),format.raw/*21.59*/(""""></script>
    <script src=""""),_display_(Seq[Any](/*22.19*/routes/*22.25*/.Assets.at("javascripts/jquery.transit_dev.js"))),format.raw/*22.72*/(""""></script>

    <script src=""""),_display_(Seq[Any](/*24.19*/routes/*24.25*/.Assets.at("typescript/common.js"))),format.raw/*24.59*/("""" type="text/javascript"></script>
    <script src=""""),_display_(Seq[Any](/*25.19*/routes/*25.25*/.Assets.at("typescript/main.js"))),format.raw/*25.57*/("""" type="text/javascript"></script>
</head>
<body onload="run();">
    <div id="songDetailContainer">
        <div id="songDetailMenuCell">
            <div class="songDetailMenuItem"> Play </div>
            <div class="songDetailMenuItem"> Play </div>
            <div class="songDetailMenuItem"> Play </div>
        </div>
        <div id="songDetailBioCell"></div>
    </div>
    <table id="magic" border="0">
        <tr class="topAlign">
            <td id="menu" style="z-index: 10">

                <div id="menuSelector"></div>
                <div id="menuSelectorBackground"></div>

                <table id="menuTable">
                </table>
            </td>
            <td id="content">
                <table>
                    <tr>
                        <td>
                            <div id="sectionContainer">
                                <table id="sectionTable">
                                </table>
                            </div>
                        </td>
                        <td class="zeroHeight">
                            <table id="itemListContainerTable">
                                <tr>
                                    <td id="itemListDivider"> <div></div> </td>
                                    <td id="itemListContainerCell">
                                        <div id="itemListContainer">
                                            <div id="itemList">
                                                <input id="newItemInput"/>
                                                <ul id="itemListItemContainer">
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <div id="globalPlaylistContainer">
        <div id="bottomPlayBar"></div>
        <div id="playButtonContainer">
            <div id="playButton">
                <span> &#x25B6; </span>

            </div>
            <div id="globalPlaylistHeader">
                <span id="durationText"> 00:00 </span>
                <img id="volumeButton" src=""""),_display_(Seq[Any](/*86.46*/routes/*86.52*/.Assets.at("images/volume_button.png"))),format.raw/*86.90*/(""""/>
                <div id="volumeSliderContainer">
                </div>
            </div>
        </div>
        <div>
            <div id="globalPlaylistSongContainer"></div>
        </div>
    </div>

</body>
</html>

<script type="text/template" id="menuTemplate">
<tr>
    <td id=""""),format.raw/*101.13*/("""{"""),format.raw/*101.14*/("""0"""),format.raw/*101.15*/("""}"""),format.raw/*101.16*/("""" class="menuItem">
        <div>
                """),format.raw/*103.17*/("""{"""),format.raw/*103.18*/("""1"""),format.raw/*103.19*/("""}"""),format.raw/*103.20*/("""
        </div>
    </td>
</tr>
</script>

<script type="text/template" id="imageMock">
<div class="mockImageContainer inline">
    <div class="mockImageInfo">
        <div class="mockImageTitle">
                """),format.raw/*113.17*/("""{"""),format.raw/*113.18*/("""0"""),format.raw/*113.19*/("""}"""),format.raw/*113.20*/(""" </div>
        <div class="mockImageArtist">
                """),format.raw/*115.17*/("""{"""),format.raw/*115.18*/("""1"""),format.raw/*115.19*/("""}"""),format.raw/*115.20*/(""" </div>
    </div>
    <img class="songImage" src="http://place-hold.it/100/a1c0c6/c1e0e6" />
</div>
</script>

<script type="text/template" id="imageLargeMock">
<img class="songImage" src="http://place-hold.it/150/a1c0c6/c1e0e6" />
</script>

<script type="text/template" id="songDetailOptionTemplate">
<div class="songDetailMenuItem">
        """),format.raw/*127.9*/("""{"""),format.raw/*127.10*/("""0"""),format.raw/*127.11*/("""}"""),format.raw/*127.12*/("""
</div>
</script>"""))}
    }
    
    def render(title:String,content:Html): play.api.templates.Html = apply(title)(content)
    
    def f:((String) => (Html) => play.api.templates.Html) = (title) => (content) => apply(title)(content)
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Fri Apr 12 18:13:25 EEST 2013
                    SOURCE: E:/Work/Scala/icer/app/views/main.scala.html
                    HASH: e87260d8aa1584e7e6627418fe6db25d19ca23cb
                    MATRIX: 509->1|616->31|703->83|729->88|1233->556|1248->562|1304->596|1398->654|1413->660|1467->692|1670->859|1685->865|1748->906|1815->937|1830->943|1886->977|1953->1008|1968->1014|2037->1061|2106->1094|2121->1100|2177->1134|2267->1188|2282->1194|2336->1226|4773->3627|4788->3633|4848->3671|5182->3976|5212->3977|5242->3978|5272->3979|5353->4031|5383->4032|5413->4033|5443->4034|5695->4257|5725->4258|5755->4259|5785->4260|5878->4324|5908->4325|5938->4326|5968->4327|6353->4684|6383->4685|6413->4686|6443->4687
                    LINES: 19->1|22->1|28->7|28->7|36->15|36->15|36->15|37->16|37->16|37->16|41->20|41->20|41->20|42->21|42->21|42->21|43->22|43->22|43->22|45->24|45->24|45->24|46->25|46->25|46->25|107->86|107->86|107->86|122->101|122->101|122->101|122->101|124->103|124->103|124->103|124->103|134->113|134->113|134->113|134->113|136->115|136->115|136->115|136->115|148->127|148->127|148->127|148->127
                    -- GENERATED --
                */
            