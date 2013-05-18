declare var $;


class PlaylistManager {

    private optionsContainer = null;

    private selectedItem = null;
    private optionsCollapsed = true;
    private selectedPlaylist = null;

    bind() {
        $("#playNow").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused");
            var songToPlay = new Song(selectedSong.attr("songid"), selectedSong.attr("songtitle"), selectedSong.attr("songartist"), selectedSong.attr("songimage"));
            mPlaylistManager.playSong(songToPlay);
        });

        $("#searchFromHere").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused")
            var query = selectedSong.attr("songtitle") + " " + selectedSong.attr("songartist");
            searchCallbackFromPlaylist(query);
        });

        $("#deleteSong").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused")
            var songId = selectedSong.attr("songid");
            mPlaylistManager.deleteSongFromPlaylist(songId);
        });
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

        this.optionsContainer = $("#playlistOptionContainer");

        var _this = this;
        $(".playlistItemOptionContainer").on("click", function (e) {
            _this.searchItemClicked(this);
        });

        $("#mobilePlayButton").on("click", () => {
            _this.playPlaylist();
        });

        $("#mobileShareButton").on("click", function (e) => {
            e.stopPropagation();
            this.sharePlaylist();
        });

        $("#mobileDeleteButton").on("click", () => {
            this.deletePlaylist();

        });

        $("#facebookButton").on("click", () => {
            this.shareOnFacebook(newURL);
        });

        $("#twitterButton").on("click", () => {
            this.shareOnTwitter(newURL);
        });

        $("#googleButton").on("click", () => {
            this.shareOnGooglePlus(newURL);
        });

        this.closeOverlay();
    }

    private playPlaylist() {
        var songs = $(".playlistItemOptionContainer");
        globalPlaylistManager.clearSongs();
        for (var i = 0; i < songs.length; i++) {
            var song = new Song(songs[i].getAttribute("songId"), songs[i].getAttribute("songTitle"), songs[i].getAttribute("songArtist"), songs[i].getAttribute("songImage"));
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
        itemManager.loadContent("/mobile/playlist/delete/" + encodeURIComponent(this.selectedPlaylist), () => {
            this.bindItems();
        });
    }

    private searchItemClicked(item) {
        if (item == this.selectedItem) {
            this.refocusOptions(item);
        } else {
            this.changeOptionsFocus(item);
        }
    }

    private refocusOptions(item) {
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        } else {
            this.takeOptionsFocus(item);
        }
    }

    private changeOptionsFocus(item) {
        $(item).addClass("playlistItemOptionContainerFocused");
        if (this.selectedItem != null) {
            $(this.selectedItem).removeClass("playlistItemOptionContainerFocused");
        }

        this.selectedItem = item;
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        }
    }

    private giveOptionsFocus() {
        this.optionsCollapsed = false;
        this.optionsContainer.fadeIn(400);
    }

    private takeOptionsFocus(item) {
        $(item).removeClass("playlistItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.fadeOut(400);
    }


    private deleteSongFromPlaylist(songId:string) {
        this.optionsContainer.fadeOut(400);
        itemManager.loadContent("/mobile/playlist/song/delete/" + encodeURIComponent(this.selectedPlaylist) + "/" + encodeURIComponent(songId), () => {
            this.bindItems();
        });
    }

    private playSong(song:Song) {
        this.optionsContainer.fadeOut(400);
        globalPlaylistManager.pushSong(song);
        //to do
        //player.playSong(song);
    }
}
var mPlaylistManager = new PlaylistManager();
