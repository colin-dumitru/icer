declare var $;


class MobilePlaylistManager {

    private optionsContainer = null;
    private selectedItem = null;
    private selectedPlaylist = null;
    private playNow = null;
    private searchFromHere = null;

    bind() {
        this.optionsContainer = $("#playlistOptionContainer");
        this.playNow = $("#playNow");
        this.searchFromHere = $("#searchFromHere");
    }

    bindControls() {
        var _this = this;
        this.playNow.click(() => {
            _this.playNowMethod();
        });

        this.searchFromHere.click(() => {
            _this.searchFromHereMethod();
        });

    }

    public playNowMethod() {
        var item = this.selectedItem;
        var song = new MSong(item.attr("songid"), item.attr("songtitle"), item.attr("songartist"), item.attr("songgenre"), item.attr("songimage"));
        globalPlaylistManager.pushSongAndPlay(song);
        this.cancelMoveOptionsToItem(this.selectedItem);
    }

    public searchFromHereMethod() {
        var item = this.selectedItem;
        var query = item.attr("songtitle") + " " + item.attr("songartist");
        performSearch(query);
    }

    public deleteSongMethod() {
        var selectedSong = this.selectedItem;
        var songId = selectedSong.attr("songid");
        mPlaylistManager.deleteSongFromPlaylist(songId);
    }

    private deleteSongFromPlaylist(songId:string) {
        var _this = this;
        $.ajax("/mobile/playlist/song/delete/" + encodeURIComponent(this.selectedPlaylist) + "/" + encodeURIComponent(songId), {
            type: "GET",
            success: function () {
                _this.deleteSongFromTable();
            },
            error: function (reason) {
                alert(reason.toString())
            }
        });
    }

    public deleteSongFromTable() {
        this.optionsContainer.remove();
        this.selectedItem.parent().remove();
    }

    onAddPlaylistInput(query:string) {
        this.addPlaylist(query);
    }

    onPlaylistSelected(id:string, title:string) {
        this.selectedPlaylist = id;
        this.loadPlaylist(id, title);
    }

    private loadPlaylist(id:string, title:string) {
        titleManager.setTitle(title);
        itemManager.loadContent("/mobile/playlist/" + encodeURIComponent(id), () => {
            this.bindItems();
        });
    }

    private addPlaylist(query:string) {
        $.ajax("/mobile/playlist/add/" + encodeURIComponent(query), {
            type: "GET",
            dataType: "json",
            success: data => {
                itemManager.addItem(<string>data.id, query);
                this.onPlaylistSelected(<string>data.id, query);
            },
            error: function (reason) {
                alert(reason.toString())
            }
        });
    }

    private bindItems() {
        var newURL = 'http%3A%2F%2Fuplayed.herokuapp.com%2Fget%2F' + this.selectedPlaylist;

        var _this = this;
        $(".playlistItemTable").draggable({
            axis: "x",
            handle: ".playlistItemOptionContainer",
            start: function () {
                _this.startMoveOption($(this));
            },
            stop: function () {
                _this.stopMoveOption($(this));
            }
        });

        $("#mobilePlayButton").click(() => {
            _this.playPlaylist();
        });

        $("#mobileShareButton").click((e) => {
            e.stopPropagation();
            this.sharePlaylist();
        });


        $("#mobileDeleteButton").click(() => {
            this.deletePlaylist();
        });

        $("#facebookButton").click(() => {
            this.shareOnFacebook(newURL);
        });

        $("#twitterButton").click(() => {
            this.shareOnTwitter(newURL);
        });

        $("#googleButton").click(() => {
            this.shareOnGooglePlus(newURL);
        });

        this.closeOverlay();
    }

    private playPlaylist() {
        var songs = $(".playlistItemTable");
        globalPlaylistManager.clearSongs();
        for (var i = 0; i < songs.length; i++) {
            var song = new MSong(songs[i].getAttribute("songId"), songs[i].getAttribute("songTitle"), songs[i].getAttribute("songArtist"), songs[i].getAttribute("songGenre"), songs[i].getAttribute("songImage"));
            if (i == 0)
                globalPlaylistManager.pushSongAndPlay(song);
            else
                globalPlaylistManager.pushSong(song);
        }
    }

    private sharePlaylist() {
        $('#box').fadeIn('fast');
    }

    private shareOnFacebook(urlPlaylist:String) {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + urlPlaylist, 'win1', 'width=500,height=400,menubar,left=100,top=100');
    }

    private shareOnTwitter(urlPlaylist:String) {
        window.open('https://twitter.com/intent/tweet?text=Currently+listening+to&url=' + urlPlaylist, 'winTwitter', 'width=500,height=400,menubar,left=100,top=100')
    }

    private shareOnGooglePlus(urlPlaylist:String) {
        window.open('https://plus.google.com/share?url=' + urlPlaylist + '&text=%7C+UPlay3D+%7C+Currently+listening+to', 'winTwitter', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=500,left=100,top=100');
    }

    private closeOverlay() {
        $(document).click(function (e) {
            if (e.target.id != "#box") {
                $('#box').fadeOut('fast');
            }
        });
    }

    private deletePlaylist() {
        titleManager.setTitle("Select An Item");

        itemManager.deleteItem(this.selectedPlaylist)
        $.ajax("/mobile/playlist/delete/" + encodeURIComponent(this.selectedPlaylist), {
            type: "GET",
            error: function (reason) {
                alert(reason.toString())
            }
        });
        itemManager.deleteItem(this.selectedPlaylist)
        $(".playlistOptions").remove();
        $(".playlistResult").remove();
    }


    private stopMoveOption(item) {
        if (item.position().left <= 0 - 3 * window.innerWidth / 4) {
            this.selectedItem = item;
            this.deleteSongMethod();
        } else if (item.position().left < -100) {
            this.moveOptionsToItem(item);
        } else {
            this.cancelMoveOptionsToItem(item);
        }
    }

    private cancelMoveOptionsToItem(item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(0,0,0)"
        });
    }

    private moveOptionsToItem(item) {
        this.selectedItem = item;
        this.bindControls();
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(-90,0,0)"
        });
    }

    private hidePreviousOption(currentItem) {
        if (this.selectedItem != null && this.selectedItem != currentItem) {
            this.selectedItem.css({
                WebkitTransition: "",
                transition: "",
                WebkitTransform: "translate3d(-0,0,0)",
                transform: "translate3d(-0,0,0)"
            });
        }
    }

    private startMoveOption(item) {
        this.hidePreviousOption(item);
        item.css({
            WebkitTransition: "",
            transition: ""
        });
        this.optionsContainer.remove();
        item.parent().prepend(this.optionsContainer);
        this.giveOptionsFocus();
    }

    private giveOptionsFocus() {
        this.optionsContainer.show(0);
    }
}
var mPlaylistManager = new MobilePlaylistManager();
