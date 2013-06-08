var Tutorial = (function () {
    function Tutorial() {
        this.sectionQueue = [];
        this.previousSection = null;
    }
    Tutorial.prototype.start = function () {
        disableUserAction = true;
        this.tutorialContent = $("#tutorialContent");
        this.tutorialInfoContainer = $("#tutorialInfoContainer");
        this.tutorialButtonNext = $("#tutorialButtonNext");
        this.tutorialButtonFinish = $("#tutorialButtonFinish");
        this.tutorialAccent = $("#tutorialAccent");
        this.bindButtons();
        this.buildSectionQueue();
        this.bindNextSection();
    };
    Tutorial.prototype.bindButtons = function () {
        var _this = this;
        this.tutorialButtonNext.click(function () {
            _this.bindNextSection();
        });
        this.tutorialButtonFinish.click(function () {
            _this.finishTutorial();
        });
    };
    Tutorial.prototype.bindNextSection = function () {
        if(this.previousSection != null) {
            this.tutorialInfoContainer.removeClass(this.previousSection.containerClass);
            this.tutorialAccent.removeClass(this.previousSection.focusClass);
        }
        var section = this.sectionQueue.pop();
        if(section == null) {
            this.showFinishTutorial();
        } else {
            this.tutorialContent.text(section.content);
            this.tutorialInfoContainer.addClass(section.containerClass);
            this.tutorialButtonNext.text(section.nextButtonText);
            this.tutorialButtonFinish.text(section.finishButtonText);
            this.tutorialAccent.addClass(section.focusClass);
            section.proceed();
            this.previousSection = section;
        }
    };
    Tutorial.prototype.showFinishTutorial = function () {
        this.tutorialContent.text("That's it for now. Have fun and enjoy your music.");
        this.tutorialButtonFinish.text("Finish Tutorial");
        this.tutorialButtonNext.remove();
    };
    Tutorial.prototype.finishTutorial = function () {
        disableUserAction = false;
        $("#tutorialContainer").remove();
    };
    Tutorial.prototype.buildSectionQueue = function () {
        this.sectionQueue.push(new GlobalPlaylistArrangeTutorial());
        this.sectionQueue.push(new GlobalPlaylistTutorial());
        this.sectionQueue.push(new PlaybackTutorial());
        this.sectionQueue.push(new SongOptionsTutorial());
        this.sectionQueue.push(new NavigationTutorial());
        this.sectionQueue.push(new SearchResultTutorial());
        this.sectionQueue.push(new ItemBarEnterTutorial());
        this.sectionQueue.push(new ItemBarOpenTutorial());
        this.sectionQueue.push(new ItemBarTutorial());
        this.sectionQueue.push(new MenuBarNavigationTutorial());
        this.sectionQueue.push(new MenuBarTutorial());
        this.sectionQueue.push(new InitialTutorialSection());
    };
    return Tutorial;
})();
var InitialTutorialSection = (function () {
    function InitialTutorialSection() {
        this.content = "Hello and welcome to U play3D. Would you like to see a short tutorial on how to use the player?";
        this.finishButtonText = "Finish tutorial.";
        this.nextButtonText = "Show Me How";
        this.containerClass = "initialTutorialSection";
        this.focusClass = "tutorialAccentHidden";
    }
    InitialTutorialSection.prototype.proceed = function () {
    };
    return InitialTutorialSection;
})();
var MenuBarTutorial = (function () {
    function MenuBarTutorial() {
        this.content = "This is your main Menu Bar, it can take you to different sections of the Player.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Tell me more";
        this.containerClass = "menuBarTutorialContent";
        this.focusClass = "menuBarTutorialAccent";
    }
    MenuBarTutorial.prototype.proceed = function () {
    };
    return MenuBarTutorial;
})();
var MenuBarNavigationTutorial = (function () {
    function MenuBarNavigationTutorial() {
        this.content = "You can either select a menu item by clicking it, or by dragging the menu selector.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Tell me more";
        this.containerClass = "menuBarTutorialContent";
        this.focusClass = "menuBarTutorialAccent";
    }
    MenuBarNavigationTutorial.prototype.proceed = function () {
        $("#radioMenu").click();
        window.setTimeout(function () {
            $("#playlistMenu").click();
        }, 1000);
        window.setTimeout(function () {
            $("#chartsMenu").click();
        }, 2000);
        window.setTimeout(function () {
            $("#searchMenu").click();
        }, 3000);
    };
    return MenuBarNavigationTutorial;
})();
var ItemBarTutorial = (function () {
    function ItemBarTutorial() {
        this.content = "When you see this vertical bar on the side of a section, it means that the section has an item list to display (such as playlists or seach sessions).";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "How do I open it?";
        this.containerClass = "itemBarTutorialContent";
        this.focusClass = "itemBarTutorialAccent";
    }
    ItemBarTutorial.prototype.proceed = function () {
    };
    return ItemBarTutorial;
})();
var ItemBarOpenTutorial = (function () {
    function ItemBarOpenTutorial() {
        this.content = "Good question! You open the item bar by hovering over it.";
        this.finishButtonText = "This is getting boring.";
        this.nextButtonText = "Got it";
        this.containerClass = "itemBarTutorialOpenedContent";
        this.focusClass = "itemBarTutorialOpenedAccent";
    }
    ItemBarOpenTutorial.prototype.proceed = function () {
        itemList.giveFocus();
    };
    return ItemBarOpenTutorial;
})();
var ItemBarEnterTutorial = (function () {
    function ItemBarEnterTutorial() {
        this.content = "You can enter your search query or playlist name at the top of the item list and a new playlist or search session will be created for you.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "That's nice";
        this.containerClass = "itemBarTutorialOpenedContent";
        this.focusClass = "itemBarTutorialEnterAccent";
    }
    ItemBarEnterTutorial.prototype.proceed = function () {
        window.setTimeout(function () {
            $("#newItemInput").val("Passenger");
        }, 750);
        window.setTimeout(function () {
            itemList.takeFocus();
            searchManager.performSearch("Passenger");
        }, 2000);
    };
    return ItemBarEnterTutorial;
})();
var SearchResultTutorial = (function () {
    function SearchResultTutorial() {
        this.content = "The newly created Search Session or Playlist will be visible in the main content area.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Looks good";
        this.containerClass = "searchFinishedTutorialContent";
        this.focusClass = "searchFinishedTutorialAccent";
    }
    SearchResultTutorial.prototype.proceed = function () {
    };
    return SearchResultTutorial;
})();
var NavigationTutorial = (function () {
    function NavigationTutorial() {
        this.content = "You can navigate between pages using arrow keys or by clicking the items in the Item Bar on the right.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Understood";
        this.containerClass = "navigationTutorialContent";
        this.focusClass = "navigationTutorialAccent";
    }
    NavigationTutorial.prototype.proceed = function () {
        searchManager.giveNextSessionFocus();
        window.setTimeout(function () {
            searchManager.giveNextPageFocus();
        }, 400);
        window.setTimeout(function () {
            searchManager.giveNextPageFocus();
        }, 1400);
        window.setTimeout(function () {
            searchManager.givePreviousPageFocus();
        }, 2400);
        window.setTimeout(function () {
            searchManager.givePreviousSessionFocus();
        }, 3400);
        window.setTimeout(function () {
            searchManager.givePreviousSessionFocus();
        }, 4400);
        window.setTimeout(function () {
            searchManager.givePreviousSessionFocus();
        }, 5400);
    };
    return NavigationTutorial;
})();
var SongOptionsTutorial = (function () {
    function SongOptionsTutorial() {
        this.content = "Each song (be it a result of a search or a song from a playlist) has certain options, which are visible if you left click on the picture of the song.";
        this.finishButtonText = "Finish tutorial now.";
        this.nextButtonText = "Okay";
        this.containerClass = "songOptionsTutorialContent";
        this.focusClass = "songOptionsTutorialAccent";
    }
    SongOptionsTutorial.prototype.proceed = function () {
        var element = $(searchManager.rootNode).find('#searchPageSongsContainer').find('.clickable')[0];
        var songInfo = $(searchManager.rootNode).find('#searchSongTitle')[0].innerHTML;
        var songName = songInfo.split("-")[0];
        var songArtist = songInfo.split("-")[1];
        var song = new Song(null, new SongInfo(songName, songArtist, null, null, 0, 0, 0), null);
        window.setTimeout(function () {
            songDetailManager.showDetails([
                {
                    label: "Play Now",
                    subOptions: []
                }, 
                {
                    label: "Add To Playlist",
                    subOptions: []
                }, 
                {
                    label: "Add to Now Playing",
                    subOptions: []
                }, 
                {
                    label: "Search From Here",
                    subOptions: []
                }
            ], function () {
            }, song, {
                x: element.getBoundingClientRect().left,
                y: element.getBoundingClientRect().top
            });
        }, 1400);
        window.setTimeout(function () {
            songDetailManager.hide();
        }, 4400);
    };
    return SongOptionsTutorial;
})();
var PlaybackTutorial = (function () {
    function PlaybackTutorial() {
        this.content = "At the bottom of the page you can find the playback buttons. They are always accessible.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Now we're talking";
        this.containerClass = "playbackTutorialContent";
        this.focusClass = "playbackTutorialAccent";
    }
    PlaybackTutorial.prototype.proceed = function () {
    };
    return PlaybackTutorial;
})();
var GlobalPlaylistTutorial = (function () {
    function GlobalPlaylistTutorial() {
        this.content = "If you hover over the bottom of the page at each side of the playback container, you can see the list of currently playing songs.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "What else?";
        this.containerClass = "globalPlaylistTutorialContent";
        this.focusClass = "globalPlaylistTutorialAccent";
    }
    GlobalPlaylistTutorial.prototype.proceed = function () {
        globalPlaylistManager.giveFocus();
    };
    return GlobalPlaylistTutorial;
})();
var GlobalPlaylistArrangeTutorial = (function () {
    function GlobalPlaylistArrangeTutorial() {
        this.content = "You can rearrange items by clicking and dragging songs. You can also access the song menu by clicking and holding on the desired song.";
        this.finishButtonText = "Just take me to my music.";
        this.nextButtonText = "Got it";
        this.containerClass = "globalPlaylistTutorialContent";
        this.focusClass = "globalPlaylistTutorialAccent";
    }
    GlobalPlaylistArrangeTutorial.prototype.proceed = function () {
        globalPlaylistManager.giveFocus();
    };
    return GlobalPlaylistArrangeTutorial;
})();
//@ sourceMappingURL=tutorial.js.map
