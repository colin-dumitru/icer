var ChartsBinder = (function () {
    function ChartsBinder() {
        this.firstDisplay = true;
    }
    ChartsBinder.prototype.buildPage = function (rootNode) {
        this.manager = new ChartsManager(rootNode);
        this.manager.addPickerPage(new PickerPage($("#chartsSongListContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsYearContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsMonthContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsWeekContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsDayContainer")));
        this.manager.bind();
    };
    ChartsBinder.prototype.bind = function () {
        if(this.firstDisplay) {
            this.loadData();
            this.firstDisplay = false;
        }
    };
    ChartsBinder.prototype.loadData = function () {
        this.manager.loadSongList("day", 0);
    };
    ChartsBinder.prototype.unbind = function () {
    };
    return ChartsBinder;
})();
var ChartsManager = (function () {
    function ChartsManager(rootNode) {
        this.rootNode = rootNode;
        this.pickerPages = [];
        this.arrowDown = template("#chartsDown");
        this.arrowUp = template("#chartsUp");
        this.arrowNoChange = template("#chartsNoChange");
    }
    ChartsManager.prototype.bind = function () {
        var _this = this;
        $("#chartsWhenButton").click(function () {
            _this.givePickerPageFocus(1);
        });
        $("#chartsYearContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.givePickerPageFocus(3);
            });
        });
        $("#chartsWeekContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.givePickerPageFocus(4);
            });
        });
        $("#chartsDayContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.updateCharts();
            });
        });
        $("#chartsDoneButton").click(function () {
            _this.updateCharts();
        });
        $("#chartsCancelButton").click(function () {
            _this.givePickerPageFocus(0);
        });
    };
    ChartsManager.prototype.updateCharts = function () {
        this.givePickerPageFocus(0);
        this.loadSongList("", 0);
    };
    ChartsManager.prototype.givePickerPageFocus = function (index) {
        var _this = this;
        this.currentIndex = index;
        this.pickerPages.forEach(function (page, i) {
            page.rootNode.transition({
                perspective: 100,
                translate3d: [
                    0, 
                    -100 * (i - _this.currentIndex), 
                    20 * (i - _this.currentIndex)
                ],
                opacity: (i > _this.currentIndex) ? 0 : (i == _this.currentIndex) ? 1 : 0.5
            }, 400).removeClass("hidden");
        });
        window.setTimeout(function () {
            _this.pickerPages.forEach(function (page, index) {
                if(index > _this.currentIndex) {
                    $(page.rootNode).addClass("hidden");
                }
            });
        }, 400);
        if(index > 1) {
            $("#chartsDoneButton").show("slide", {
                direction: "left"
            }, 200);
        } else {
            $("#chartsDoneButton").hide("slide", {
                direction: "left"
            }, 200);
        }
        if(index > 0) {
            $("#chartsCancelButton").show("slide", {
                direction: "left"
            }, 200);
        } else {
            $("#chartsCancelButton").hide("slide", {
                direction: "left"
            }, 200);
        }
    };
    ChartsManager.prototype.addPickerPage = function (pickerPage) {
        this.pickerPages.push(pickerPage);
    };
    ChartsManager.prototype.loadSongList = function (timeUnit, period) {
        var songList = this.mockSongList();
        this.setSongList(songList);
    };
    ChartsManager.prototype.mockSongList = function () {
        var songList = [];
        for(var i = 0; i < 99; i++) {
            var id = "chartSong" + Math.floor(Math.random() * 100000);
            songList.push(this.mockSong(id));
        }
        return songList;
    };
    ChartsManager.prototype.mockSong = function (id) {
        var songTitle = randomSongTitle();
        return new ChartSong(id, "", Math.floor(10 - Math.random() * 20), Math.floor(Math.random() * 100), songTitle.title, songTitle.artist);
    };
    ChartsManager.prototype.setSongList = function (songList) {
        var _this = this;
        $("#chartsSongListContainer").empty();
        songList.forEach(function (song, index) {
            var rootNode = _this.buildSongTemplate(song, index + 1);
            var manager = new ChartSongManager(song, rootNode, index);
            $("#chartsSongListContainer").append(manager.rootNode);
        });
    };
    ChartsManager.prototype.buildSongTemplate = function (song, index) {
        var positionChange = Math.abs(song.positionChange).toString();
        var positionIcon = this.buildPositionIcon(song.positionChange);
        var positionClass = this.buildPositionClass(song.positionChange);
        var songTemplate = template("#chartsSongTemplate", song.title, song.artist, positionChange, positionClass, index.toString());
        var rootDiv = $("<div></div>");
        rootDiv.append(songTemplate);
        rootDiv.find("#chartChangeArrowContainer").append(positionIcon);
        rootDiv.attr("id", song.id);
        return rootDiv;
    };
    ChartsManager.prototype.buildPositionIcon = function (change) {
        if(change < 0) {
            return this.arrowDown;
        }
        if(change > 0) {
            return this.arrowUp;
        }
        return this.arrowNoChange;
    };
    ChartsManager.prototype.buildPositionClass = function (change) {
        if(change < 0) {
            return "chartChangeArrowDown";
        }
        if(change > 0) {
            return "chartChangeArrowUp";
        }
        return "chartChangeArrowEqual";
    };
    return ChartsManager;
})();
var PickerPage = (function () {
    function PickerPage(rootNode) {
        this.rootNode = rootNode;
    }
    return PickerPage;
})();
var ChartSongManager = (function () {
    function ChartSongManager(chartSong, rootNode, index) {
        this.chartSong = chartSong;
        this.rootNode = rootNode;
    }
    return ChartSongManager;
})();
var ChartSong = (function () {
    function ChartSong(id, imageUrl, positionChange, peekPosition, title, artist) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.positionChange = positionChange;
        this.peekPosition = peekPosition;
        this.title = title;
        this.artist = artist;
    }
    return ChartSong;
})();
//@ sourceMappingURL=charts.js.map
