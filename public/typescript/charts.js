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
        var currentDate = new Date();
        var date = new ChartDate(currentDate.getFullYear(), (currentDate.getMonth() + 1), currentDate.getDate());
        this.manager.loadSongList(date.toString(), date.toString());
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
                _this.endDate = new ChartDate(parseInt(elem.innerHTML), 12, 31);
                _this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each(function (index, elem) {
            $(elem).click(function () {
                var month = index + 1;
                _this.startDate.month = month;
                _this.endDate.month = month;
                if($.inArray(month, _this.longMonths) != -1) {
                    _this.displayContainerValues("chartsWeekContainer", 0);
                } else {
                    if($.inArray(month, _this.shortMonths) != -1) {
                        _this.endDate.day = 30;
                        _this.displayContainerValues("chartsWeekContainer", 1);
                    } else {
                        if(month == 2) {
                            if(_this.endDate.year % 4 == 0) {
                                _this.endDate.day = 29;
                                _this.displayContainerValues("chartsWeekContainer", 2);
                            } else {
                                _this.endDate.day = 28;
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
                var week;
                _this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                _this.endDate.day = parseInt(elem.childNodes[1].innerHTML.substr(4, 2));
                if($(elem).parent().index() == 0) {
                    week = $(elem).index() + 1;
                } else {
                    if($(elem).parent().index() == 1) {
                        week = $(elem).index() + 3;
                    } else {
                        week = 5;
                    }
                }
                if(week < 5) {
                    _this.displayContainerValues("chartsDayContainer", (week - 1));
                } else {
                    if(week == 5) {
                        if(_this.endDate.month == 12) {
                            _this.endDate.month = 1;
                            _this.endDate.year += 1;
                        } else {
                            _this.endDate.month += 1;
                        }
                        if($.inArray(_this.startDate.month, _this.longMonths) != -1) {
                            _this.displayContainerValues("chartsDayContainer", 4);
                        } else {
                            if($.inArray(_this.startDate.month, _this.shortMonths) != -1) {
                                _this.displayContainerValues("chartsDayContainer", 5);
                            } else {
                                if(_this.endDate.year % 4 == 0) {
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
                _this.endDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                if(_this.startDate.month != _this.endDate.month) {
                    if(_this.startDate.day < 29) {
                        if(_this.startDate.month != 12) {
                            _this.startDate.month += 1;
                        } else {
                            _this.startDate.year += 1;
                            _this.startDate.month = 1;
                        }
                    }
                    if(_this.endDate.day >= 29) {
                        _this.endDate.month -= 1;
                    }
                }
                _this.updateCharts(_this.startDate.toString(), _this.endDate.toString());
            });
        });
        $("#chartsDoneButton").click(function () {
            _this.updateCharts(_this.startDate.toString(), _this.endDate.toString());
        });
        $("#chartsCancelButton").click(function () {
            _this.givePickerPageFocus(0);
        });
    };
    ChartsManager.prototype.displayContainerValues = function (container, index) {
        var children = document.getElementById(container).children;
        var length = children.length;
        for(var i = 0; i < length; i++) {
            if(i != index) {
                $(children[i]).css("display", "none");
            } else {
                $(children[index]).css("display", "table");
            }
        }
    };
    ChartsManager.prototype.updateCharts = function (startDate, endDate) {
        this.givePickerPageFocus(0);
        this.loadSongList(startDate, endDate);
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
    ChartsManager.prototype.loadSongList = function (startDate, endDate) {
        var _this = this;
        $.ajax("/chart/generate/" + startDate + '/' + endDate, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.length == 0) {
                }
                _this.setSongList(data);
            },
            error: function (reason) {
                alert(reason);
            }
        });
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
//@ sourceMappingURL=charts.js.map
