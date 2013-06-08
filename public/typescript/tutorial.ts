class Tutorial {
    private sectionQueue:TutorialSection[] = [];

    private tutorialContent;
    private tutorialInfoContainer;
    private tutorialButtonNext;
    private tutorialButtonFinish;
    private tutorialAccent;

    private previousSection:TutorialSection = null;


    start() {
        disableUserAction = true;
        this.tutorialContent = $("#tutorialContent");

        this.tutorialInfoContainer = $("#tutorialInfoContainer");
        this.tutorialButtonNext = $("#tutorialButtonNext");
        this.tutorialButtonFinish = $("#tutorialButtonFinish");
        this.tutorialAccent = $("#tutorialAccent");

        this.bindButtons();
        this.buildSectionQueue();
        this.bindNextSection();
    }

    bindButtons() {
        this.tutorialButtonNext.click(() => {
            this.bindNextSection();
        });

        this.tutorialButtonFinish.click(() => {
            this.finishTutorial();
        });
    }

    bindNextSection() {
        if (this.previousSection != null) {
            this.tutorialInfoContainer.removeClass(this.previousSection.containerClass);
            this.tutorialAccent.removeClass(this.previousSection.focusClass);
        }

        var section = this.sectionQueue.pop();

        if (section == null) {
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
    }

    showFinishTutorial() {
        this.tutorialContent.text("That's it for now. Have fun and enjoy your music.");
        this.tutorialButtonFinish.text("Finish Tutorial");
        this.tutorialButtonNext.remove();
    }

    finishTutorial() {
        disableUserAction = false;
        $("#tutorialContainer").remove();
    }

    buildSectionQueue() {
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
    }
}

interface TutorialSection{
    content:string;
    finishButtonText:string;
    nextButtonText:string;
    containerClass:string;
    focusClass:string;

    proceed();
}

class InitialTutorialSection implements TutorialSection {
    content:string = "Hello and welcome to U play3D. Would you like to see a short tutorial on how to use the player?";
    finishButtonText:string = "Finish tutorial.";
    nextButtonText:string = "Show Me How";
    containerClass:string = "initialTutorialSection";
    focusClass:string = "tutorialAccentHidden";

    proceed() {

    }
}

class MenuBarTutorial implements TutorialSection {
    content:string = "This is your main Menu Bar, it can take you to different sections of the Player.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Tell me more";
    containerClass:string = "menuBarTutorialContent";
    focusClass:string = "menuBarTutorialAccent";

    proceed() {

    }
}


class MenuBarNavigationTutorial implements TutorialSection {
    content:string = "You can either select a menu item by clicking it, or by dragging the menu selector.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Tell me more";
    containerClass:string = "menuBarTutorialContent";
    focusClass:string = "menuBarTutorialAccent";

    proceed() {
        $("#radioMenu").click();
        window.setTimeout(() => {
            $("#playlistMenu").click();
        }, 1000);
        window.setTimeout(() => {
            $("#chartsMenu").click();
        }, 2000);
        window.setTimeout(() => {
            $("#searchMenu").click();
        }, 3000);
    }
}

class ItemBarTutorial implements TutorialSection {
    content:string = "When you see this vertical bar on the side of a section, it means that the section has an item list to display (such as playlists or seach sessions).";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "How do I open it?";
    containerClass:string = "itemBarTutorialContent";
    focusClass:string = "itemBarTutorialAccent";

    proceed() {

    }
}

class ItemBarOpenTutorial implements TutorialSection {
    content:string = "Good question! You open the item bar by hovering over it.";
    finishButtonText:string = "This is getting boring.";
    nextButtonText:string = "Got it";
    containerClass:string = "itemBarTutorialOpenedContent";
    focusClass:string = "itemBarTutorialOpenedAccent";

    proceed() {
        itemList.giveFocus();
    }
}

class ItemBarEnterTutorial implements TutorialSection {
    content:string = "You can enter your search query or playlist name at the top of the item list and a new playlist or search session will be created for you.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "That's nice";
    containerClass:string = "itemBarTutorialOpenedContent";
    focusClass:string = "itemBarTutorialEnterAccent";

    proceed() {
        window.setTimeout(() => {
            $("#newItemInput").val("Passenger");
        }, 750);
        window.setTimeout(() => {
            itemList.takeFocus();
            searchManager.performSearch("Passenger")
        }, 2000);
    }
}

class SearchResultTutorial implements TutorialSection {
    content:string = "The newly created Search Session or Playlist will be visible in the main content area.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Looks good";
    containerClass:string = "searchFinishedTutorialContent";
    focusClass:string = "searchFinishedTutorialAccent";

    proceed() {

    }
}

class NavigationTutorial implements TutorialSection {
    content:string = "You can navigate between pages using arrow keys or by clicking the items in the Item Bar on the right.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Understood";
    containerClass:string = "navigationTutorialContent";
    focusClass:string = "navigationTutorialAccent";

    proceed() {
        searchManager.giveNextSessionFocus();

        window.setTimeout(() => {
            searchManager.giveNextPageFocus();
        }, 400);
        window.setTimeout(() => {
            searchManager.giveNextPageFocus();
        }, 1400);
        window.setTimeout(() => {
            searchManager.givePreviousPageFocus();
        }, 2400);
        window.setTimeout(() => {
            searchManager.givePreviousSessionFocus();
        }, 3400);
        window.setTimeout(() => {
            searchManager.givePreviousSessionFocus();
        }, 4400);
        window.setTimeout(() => {
            searchManager.givePreviousSessionFocus();
        }, 5400);


    }
}

class SongOptionsTutorial implements TutorialSection {
    content:string = "Each song (be it a result of a search or a song from a playlist) has certain options, which are visible if you left click on the picture of the song.";
    finishButtonText:string = "Finish tutorial now.";
    nextButtonText:string = "Okay";
    containerClass:string = "songOptionsTutorialContent";
    focusClass:string = "songOptionsTutorialAccent";

    proceed() {

        var element = $(searchManager.rootNode).find('#searchPageSongsContainer').find('.clickable')[0];
        var songInfo = $(searchManager.rootNode).find('#searchSongTitle')[0].innerHTML;
        var songName = songInfo.split("-")[0];
        var songArtist = songInfo.split("-")[1];
        var song = new Song(null, new SongInfo(songName, songArtist, null, null, 0, 0, 0), null);

        window.setTimeout(() => {
            songDetailManager.showDetails([
                {label: "Play Now", subOptions: null},
                {label: "Add To Playlist", subOptions: null},
                {label: "Add to Now Playing", subOptions: null},
                {label: "Search From Here", subOptions: null}
            ],
                function () {
                },
                song,
                {x: element.getBoundingClientRect().left, y: element.getBoundingClientRect().top});
        }, 1400);
        window.setTimeout(() => {
            songDetailManager.hide();
        }, 4400);

    }
}

class PlaybackTutorial implements TutorialSection {
    content:string = "At the bottom of the page you can find the playback buttons. They are always accessible.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Now we're talking";
    containerClass:string = "playbackTutorialContent";
    focusClass:string = "playbackTutorialAccent";

    proceed() {
    }
}


class GlobalPlaylistTutorial implements TutorialSection {
    content:string = "If you hover over the bottom of the page at each side of the playback container, you can see the list of currently playing songs.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "What else?";
    containerClass:string = "globalPlaylistTutorialContent";
    focusClass:string = "globalPlaylistTutorialAccent";

    proceed() {
        globalPlaylistManager.giveFocus();
    }
}

class GlobalPlaylistArrangeTutorial implements TutorialSection {
    content:string = "You can rearrange items by clicking and dragging songs. You can also access the song menu by clicking and holding on the desired song.";
    finishButtonText:string = "Just take me to my music.";
    nextButtonText:string = "Got it";
    containerClass:string = "globalPlaylistTutorialContent";
    focusClass:string = "globalPlaylistTutorialAccent";

    proceed() {
        globalPlaylistManager.giveFocus();
    }
}