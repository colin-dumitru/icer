function run() {
    var sections = [];
    sections.push(buildSearchSection());
    sections.push(buildPlaylistSection());
    sections.push(buildHistorySection());
    sections.push(buildRadioSection());
    sections.push(buildTopSection());
    var sectionManager = new SectionManager(sections);
    sectionManager.build();
    sectionManager.resize();
    $(window).resize(function () {
        sectionManager.resize();
    });
    itemList.bind();
    playManager.bind();
    globalPlaylistManager.bind();
    songDetailManager.bind();
}
function buildSearchSection() {
    return new Section("Search", "search", "/assets/sections/search.html");
}
function buildPlaylistSection() {
    return new Section("Playlist", "playlist", "/assets/sections/playlists.html");
}
function buildHistorySection() {
    return new Section("History", "history", "/assets/sections/history.html");
}
function buildRadioSection() {
    return new Section("Radio", "radio", "/assets/sections/radio.html");
}
function buildTopSection() {
    return new Section("Chart", "charts", "/assets/sections/charts.html");
}
var SectionManager = (function () {
    function SectionManager(sections) {
        this.sections = sections;
    }
    SectionManager.prototype.build = function () {
        this.bindMenuSelector();
        this.buildMenu();
        this.buildSectionPages();
    };
    SectionManager.prototype.buildSectionPages = function () {
        var _this = this;
        this.sections.forEach(function (section) {
            _this.buildSectionPage(section);
        });
    };
    SectionManager.prototype.buildSectionPage = function (section) {
        var _this = this;
        var td = $(document.createElement("td"));
        section.rootNode = $(document.createElement("tr"));
        section.rootNode.addClass("section");
        section.rootNode.css("id", section.id + "Section");
        section.rootNode.append(td);
        td.load(section.url, function () {
            _this.onPageLoadComplete(section);
        });
        td.css("height", Math.round(100 / this.sections.length) + "%");
        $("#sectionTable").append(section.rootNode);
    };
    SectionManager.prototype.onPageLoadComplete = function (section) {
        binders[section.id].buildPage(section.rootNode);
        if(this.sections.indexOf(section) == 0) {
            this.changeSection(0);
        }
    };
    SectionManager.prototype.bindMenuSelector = function () {
        var us = this;
        $("#menuSelector").draggable({
            containment: "#menu",
            axis: "y",
            start: function () {
                binders[us.currentSection.id].unbind();
            },
            drag: function (event, ui) {
                $("#menuSelectorBackground").css({
                    top: ui.position.top
                });
                $("#sectionTable").css({
                    top: -ui.position.top * us.sections.length
                });
            },
            stop: function (event, ui) {
                us.changeSection(us.closestMenuItem(ui.position.top));
            }
        });
    };
    SectionManager.prototype.changeSection = function (index) {
        this.currentSection = this.sections[index];
        $("#menuSelector").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#menuSelectorBackground").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#sectionTable").animate({
            top: -index * Dimensions.windowHeight
        });
        binders[this.currentSection.id].bind();
    };
    SectionManager.prototype.closestMenuItem = function (top) {
        var closestOffset = top / Dimensions.menuItemHeight;
        return Math.round(closestOffset);
    };
    SectionManager.prototype.buildMenu = function () {
        var _this = this;
        this.sections.forEach(function (section) {
            _this.buildMenuSection(section);
        });
    };
    SectionManager.prototype.buildMenuSection = function (section) {
        var _this = this;
        var sectionTemplate = template("#menuTemplate", section.id + "Menu", section.menuLabel);
        $("#menuTable").append(sectionTemplate);
        $("#menuTable #" + section.id + "Menu").click(function () {
            binders[_this.currentSection.id].unbind();
            _this.changeSection(_this.sections.indexOf(section));
        });
    };
    SectionManager.prototype.resize = function () {
        Dimensions.menuItemHeight = $("#" + this.sections[0].id + "Menu").height();
        Dimensions.menuItemWidth = $("#" + this.sections[0].id + "Menu").width();
        Dimensions.windowHeight = $(window).height();
        Dimensions.windowWidth = $(window).width();
        $("#menuSelector").css("height", Dimensions.menuItemHeight);
        $("#menuSelectorBackground").css("height", Dimensions.menuItemHeight);
        $("#sectionContainer").css("height", Dimensions.windowHeight);
        $("#sectionTable").css("height", Dimensions.windowHeight * this.sections.length);
    };
    return SectionManager;
})();
var Section = (function () {
    function Section(menuLabel, id, url) {
        this.menuLabel = menuLabel;
        this.id = id;
        this.url = url;
    }
    return Section;
})();
var ItemList = (function () {
    function ItemList() {
        this.isCollapsed = true;
        this.itemList = [];
        this.itemListQueue = {
        };
    }
    ItemList.prototype.pushItemList = function (key) {
        this.itemListQueue[key] = {
            itemList: this.itemList,
            selectedItem: this.selectedItem
        };
        $("#itemListItemContainer").empty();
    };
    ItemList.prototype.popItemList = function (key) {
        var _this = this;
        var itemData = this.itemListQueue[key];
        if(itemData == null) {
            itemData = {
                itemList: [],
                selectedItem: null
            };
        }
        this.itemList = itemData.itemList;
        this.selectedItem = itemData.selectedItem;
        this.itemList.forEach(function (item) {
            $("#itemListItemContainer").append(item.rootNode);
            _this.bindItemNode(item);
        });
    };
    ItemList.prototype.bind = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if(event.clientX > (Dimensions.windowWidth - 15)) {
                if(_this.isCollapsed) {
                    _this.giveFocus();
                }
            }
            if(event.clientX < (Dimensions.windowWidth - 250)) {
                if(!_this.isCollapsed) {
                    _this.takeFocus();
                }
            }
        });
        var input = $("#newItemInput");
        input.keypress(function (event) {
            if(event.which == 13) {
                if(_this.onInput == null) {
                    return;
                }
                var text = input.val();
                input.val("");
                _this.onInput(text);
            }
        });
    };
    ItemList.prototype.show = function () {
        $("#itemListContainerTable").show(400);
    };
    ItemList.prototype.hide = function () {
        $("#itemListContainerTable").hide(400);
    };
    ItemList.prototype.giveFocus = function () {
        $("#itemListContainer").transition({
            width: 250,
            perspective: "100px",
            rotateY: '0deg',
            transformOrigin: '0% 50%'
        });
        $("#sectionContainer").transition({
            perspective: "100px",
            rotateY: '-5deg',
            transformOrigin: '100% 50%'
        });
        this.isCollapsed = false;
    };
    ItemList.prototype.takeFocus = function () {
        $("#itemListContainer").transition({
            width: 0,
            perspective: "100px",
            rotateY: '10deg',
            transformOrigin: '0% 50%'
        });
        $("#sectionContainer").transition({
            perspective: "100px",
            rotateY: '0deg',
            transformOrigin: '100% 50%'
        });
        this.isCollapsed = true;
    };
    ItemList.prototype.addItem = function (item) {
        this.itemList.push(item);
        this.buildItemNode(item);
        this.bindItemNode(item);
    };
    ItemList.prototype.bindItemNode = function (item) {
        var _this = this;
        item.rootNode.click(function () {
            _this.switchItem(item);
            if(item.onSelect != null) {
                item.onSelect();
            }
        });
    };
    ItemList.prototype.switchItem = function (item) {
        if(this.selectedItem != null) {
            this.selectedItem.rootNode.removeClass("itemListFocused");
        }
        item.rootNode.addClass("itemListFocused");
        this.selectedItem = item;
        this.takeFocus();
    };
    ItemList.prototype.buildItemNode = function (item) {
        var li = document.createElement("li");
        item.rootNode = $(li);
        item.rootNode.append(item.title);
        $("#itemListItemContainer").append(li);
    };
    return ItemList;
})();
var Item = (function () {
    function Item(id, title) {
        this.id = id;
        this.title = title;
    }
    return Item;
})();
var PlayManager = (function () {
    function PlayManager() { }
    PlayManager.prototype.bind = function () {
        $("#playButton").click(function () {
            $(this).toggleClass("playButtonPaused");
        });
    };
    return PlayManager;
})();
var GlobalPlaylistManager = (function () {
    function GlobalPlaylistManager() {
        this.isCollapsed = true;
        this.isVolumeVisible = false;
    }
    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if(event.clientY > (Dimensions.windowHeight - 15)) {
                if(_this.isCollapsed) {
                    _this.giveFocus();
                }
            }
            if(event.clientY < (Dimensions.windowHeight - 155)) {
                if(!_this.isCollapsed) {
                    _this.takeFocus();
                }
                if(_this.isVolumeVisible) {
                    $("#volumeSliderContainer").hide();
                }
            }
        });
        $("#volumeSliderContainer").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });
        $("#volumeButton").mouseenter(function () {
            $("#volumeSliderContainer").show();
            _this.isVolumeVisible = true;
        });
        var imageTemplate = template("#imageMock");
        for(var i = 0; i < 25; i++) {
            $("#globalPlaylistSongContainer").append(imageTemplate);
        }
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        $("#globalPlaylistContainer").transition({
            bottom: 120
        });
        $("#globalPlaylistSongContainer").transition({
            perspective: "100px",
            transformOrigin: '50% 0%',
            rotateX: 0
        });
        $("#sectionContainer").transition({
            perspective: "100px",
            rotateX: '5deg',
            y: -150,
            transformOrigin: '50% 100%'
        });
        this.isCollapsed = false;
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        $("#globalPlaylistContainer").transition({
            bottom: 0
        });
        $("#globalPlaylistSongContainer").transition({
            perspective: "100px",
            transformOrigin: '50% 0%',
            rotateX: -10
        });
        $("#sectionContainer").transition({
            perspective: "100px",
            rotateX: '0deg',
            y: 0,
            transformOrigin: '50% 100%'
        });
        this.isCollapsed = true;
    };
    return GlobalPlaylistManager;
})();
var binders = {
};
var itemList = new ItemList();
var playManager = new PlayManager();
var globalPlaylistManager = new GlobalPlaylistManager();
//@ sourceMappingURL=main.js.map
