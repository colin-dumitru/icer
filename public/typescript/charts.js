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
        if (this.firstDisplay) {
            chartPlaylistManager.bind();
            this.loadData();
            this.firstDisplay = false;
        }
    };
    ChartsBinder.prototype.loadData = function () {
        var currentDate = new Date();
        var date = new ChartDate(currentDate.getFullYear(), (currentDate.getMonth() + 1), currentDate.getDate());
        this.manager.loadSongList(date.toString(), "1 day");
    };
    ChartsBinder.prototype.unbind = function () {
    };
    return ChartsBinder;
})();
var ChartsManager = (function () {
    function ChartsManager(rootNode) {
        this.rootNode = rootNode;
        this.pickerPages = [];
        this.longMonths = [
            1,
            3,
            5,
            7,
            8,
            10,
            12
        ];
        this.shortMonths = [
            4,
            6,
            9,
            11
        ];
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
                _this.startDate = new ChartDate(parseInt(elem.innerHTML), 1, 1);
                _this.interval = "1 year";
                _this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                var month = index + 1;
                _this.startDate.month = month;
                _this.interval = "1 month";
                if ($.inArray(month, _this.longMonths) != -1) {
                    _this.displayContainerValues("chartsWeekContainer", 0);
                } else {
                    if ($.inArray(month, _this.shortMonths) != -1) {
                        _this.displayContainerValues("chartsWeekContainer", 1);
                    } else {
                        if (month == 2) {
                            if (_this.startDate.year % 4 == 0) {
                                _this.displayContainerValues("chartsWeekContainer", 2);
                            } else {
                                _this.displayContainerValues("chartsWeekContainer", 3);
                            }
                        }
                    }
                }
                _this.givePickerPageFocus(3);
            });
        });
        $("#chartsWeekContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                _this.interval = "1 week";
                if ($(elem).parent().index() == 0) {
                    _this.week = $(elem).index() + 1;
                } else {
                    if ($(elem).parent().index() == 1) {
                        _this.week = $(elem).index() + 3;
                    } else {
                        _this.week = 5;
                    }
                }
                if (_this.week < 5) {
                    _this.displayContainerValues("chartsDayContainer", (_this.week - 1));
                } else {
                    if (_this.week == 5) {
                        if ($.inArray(_this.startDate.month, _this.longMonths) != -1) {
                            _this.displayContainerValues("chartsDayContainer", 4);
                        } else {
                            if ($.inArray(_this.startDate.month, _this.shortMonths) != -1) {
                                _this.displayContainerValues("chartsDayContainer", 5);
                            } else {
                                if (_this.startDate.year % 4 == 0) {
                                    _this.displayContainerValues("chartsDayContainer", 6);
                                }
                            }
                        }
                    }
                }
                _this.givePickerPageFocus(4);
            });
        });
        $("#chartsDayContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                _this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                _this.interval = "1 day";
                if (_this.week == 5 && _this.startDate.day < 29) {
                    _this.startDate.month += 1;
                }
                _this.updateCharts(_this.startDate.toString(), _this.interval);
            });
        });
        $("#chartsDoneButton").click(function () {
            _this.updateCharts(_this.startDate.toString(), _this.interval);
        });
        $("#chartsCancelButton").click(function () {
            _this.givePickerPageFocus(0);
        });
    };
    ChartsManager.prototype.displayContainerValues = function (container, index) {
        var children = document.getElementById(container).children;
        var length = children.length;
        for (var i = 0; i < length; i++) {
            if (i != index) {
                $(children[i]).css("display", "none");
            } else {
                $(children[index]).css("display", "table");
            }
        }
    };
    ChartsManager.prototype.updateCharts = function (startDate, interval) {
        this.givePickerPageFocus(0);
        this.loadSongList(startDate, interval);
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
                if (index > _this.currentIndex) {
                    $(page.rootNode).addClass("hidden");
                }
            });
        }, 400);
        if (index > 1) {
            $("#chartsDoneButton").show("slide", {
                direction: "left"
            }, 200);
        } else {
            $("#chartsDoneButton").hide("slide", {
                direction: "left"
            }, 200);
        }
        if (index > 0) {
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
    ChartsManager.prototype.loadSongList = function (startDate, endDate) {
        var _this = this;
        $.ajax("/chart/generate/" + startDate + '/' + endDate, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                var songs = [
                    data.length
                ];
                for (var i = 0, len = data.length; i < len; i++) {
                    var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, data[i].peek, data[i].weeksOnTop, data[i].positionChange);
                    songs[i] = new Song(data[i].mbid, songInfo, data[i].imageUrl);
                }
                _this.setSongList(songs);
            }
        });
    };
    ChartsManager.prototype.setSongList = function (songList) {
        var _this = this;
        $("#chartsSongListContainer").empty();
        songList.forEach(function (song, index) {
            var rootNode = _this.buildSongTemplate(song, index + 1);
            var manager = new ChartSongManager(song, rootNode, index);
            manager.bind();
            $("#chartsSongListContainer").append(manager.rootNode);
        });
    };
    ChartsManager.prototype.buildSongTemplate = function (song, index) {
        var positionChange = Math.abs(song.info.positionChange).toString();
        var positionIcon = this.buildPositionIcon(song.info.positionChange);
        var positionClass = this.buildPositionClass(song.info.positionChange);
        var songTemplate = template("#chartsSongTemplate", song.info.title, song.info.artist, positionChange.toString(), positionClass, index.toString(), song.imageUrl, song.info.peek.toString(), song.info.weeksOnTop.toString());
        var rootDiv = $("<div></div>");
        rootDiv.append(songTemplate);
        rootDiv.find("#chartChangeArrowContainer").append(positionIcon);
        rootDiv.attr("id", song.mbid);
        return rootDiv;
    };
    ChartsManager.prototype.buildPositionIcon = function (change) {
        if (change < 0) {
            return this.arrowDown;
        }
        if (change > 0) {
            return this.arrowUp;
        }
        return this.arrowNoChange;
    };
    ChartsManager.prototype.buildPositionClass = function (change) {
        if (change < 0) {
            return "chartChangeArrowDown";
        }
        if (change > 0) {
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
    function ChartSongManager(song, rootNode, index) {
        this.song = song;
        this.rootNode = rootNode;
    }

    ChartSongManager.prototype.bind = function () {
        var _this = this;
        $(this.rootNode).find("#chartPlayNow").click(function () {
            _this.playSong(_this.song);
        });
        $(this.rootNode).find("#chartSearchFromHere").click(function () {
            _this.changeToSearchSection();
            _this.searchFromSong(_this.song);
        });
        $(this.rootNode).find("#chartAddToPlaylist").click(function (e) {
            var chartPlaylistCallback = function (selectedPlaylist, playlistTitle) {
                _this.addSongToPlaylist(_this.song, selectedPlaylist, playlistTitle);
            };
            chartPlaylistManager.showPlaylists(_this.buildPlaylistList(), chartPlaylistCallback, {
                x: $("#chartAddToPlaylist").offset().left,
                y: e.pageY
            });
        });
    };
    ChartSongManager.prototype.searchFromSong = function (song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    };
    ChartSongManager.prototype.changeToSearchSection = function () {
        sectionManager.changeSection(0);
    };
    ChartSongManager.prototype.playSong = function (song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    };
    ChartSongManager.prototype.addSongToPlaylist = function (song, playlistIndex, title) {
        if (playlistIndex == null) {
            this.addSongToNewPlaylist(song, title);
        } else {
            var selectedPlaylist = playlistManager.getPlaylist()[playlistIndex];
            playlistManager.addSongToPlaylist(song, selectedPlaylist);
            this.pushSongToPlaylist(song, selectedPlaylist.id);
        }
    };
    ChartSongManager.prototype.pushSongToPlaylist = function (song, playlistId) {
        $.ajax({
            url: "/playlist/song/add/" + playlistId,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(song)
        });
    };
    ChartSongManager.prototype.addSongToNewPlaylist = function (song, title) {
        var _this = this;
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                _this.pushSongToPlaylist(song, data.id);
                playlistManager.loadPlaylist(data.id, title);
                playlistManager.addSongToPlaylist(song, playlistManager.getPlaylistMap()[data.id]);
            }
        });
    };
    ChartSongManager.prototype.buildPlaylistList = function () {
        return playlistManager.getPlaylist().map(function (p) {
            return p.title;
        });
    };
    return ChartSongManager;
})();
var ChartDate = (function () {
    function ChartDate(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    ChartDate.prototype.toString = function () {
        return "'" + this.year + '-' + this.month + '-' + this.day + "'";
    };
    return ChartDate;
})();
var ChartPlaylistManager = (function () {
    function ChartPlaylistManager() {
        this.menuHidden = true;
    }

    ChartPlaylistManager.prototype.bind = function () {
        var chartPlaylistContainer = $("#chartPlaylistContainer");
        this.menuWidth = chartPlaylistContainer.width();
        this.menuHeight = chartPlaylistContainer.height();
        this.bindHover();
    };
    ChartPlaylistManager.prototype.showPlaylists = function (playlists, chartPlaylistCallback, position) {
        this.menuHidden = false;
        $("#chartPlaylistContainer").empty();
        var container = $("<div></div>");
        var optionTemplate = template("#chartPlaylistTemplate");
        container.append(optionTemplate);
        $("#chartPlaylistContainer").append(container);
        this.buildPlaylist(playlists, chartPlaylistCallback, container);
        this.updateLayout(position);
        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;
    };
    ChartPlaylistManager.prototype.buildPlaylist = function (playlists, chartPlaylistCallback, parentTemplate) {
        var _this = this;
        var listContainer = parentTemplate.find("#chartPlaylistOptionsContainer");
        var container = parentTemplate.find("#chartPlaylistOptionsList");
        var _this = this;
        listContainer.show();
        listContainer.find("#chartPlaylistInput").keypress(function (event) {
            if (event.which == 13) {
                var text = this.value;
                this.value = "";
                chartPlaylistCallback(null, text);
                _this.hide();
            }
        });
        playlists.forEach(function (playlist, index) {
            var li = $("<li></li>");
            li.append(playlist);
            container.append(li);
            _this.bindPlaylistClick(index, li, chartPlaylistCallback);
        });
    };
    ChartPlaylistManager.prototype.bindPlaylistClick = function (playlistIndex, template, chartPlaylistCallback) {
        var _this = this;
        template.click(function () {
            chartPlaylistCallback(playlistIndex, null);
            _this.hide();
        });
    };
    ChartPlaylistManager.prototype.updateLayout = function (position) {
        $("#chartPlaylistContainer").css("left", position.x).css("top", position.y + 15).show(300);
    };
    ChartPlaylistManager.prototype.bindHover = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if (_this.menuHidden) {
                return;
            }
            if (event.clientX < (_this.menuX - 10) || event.clientX > (_this.menuX + _this.menuWidth + 10) || event.clientY < (_this.menuY - 10) || event.clientY > (_this.menuY + _this.menuHeight + 10)) {
                _this.hide();
            }
        });
    };
    ChartPlaylistManager.prototype.hide = function () {
        $("#chartPlaylistContainer").hide(300);
        this.menuHidden = true;
    };
    ChartPlaylistManager.prototype.hasSpaceOnRight = function (x) {
        return x + this.menuWidth < dimensions.windowWidth || x < this.menuWidth;
    };
    ChartPlaylistManager.prototype.hasSpaceOnBottom = function (y) {
        return y + this.menuHeight < dimensions.windowHeight || y < this.menuHeight;
    };
    return ChartPlaylistManager;
})();
var chartPlaylistManager = new ChartPlaylistManager();
//@ sourceMappingURL=charts.js.map
