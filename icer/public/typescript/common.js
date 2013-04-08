var Dimensions = (function () {
    function Dimensions() { }
    return Dimensions;
})();
function template(id) {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        args[_i] = arguments[_i + 1];
    }
    var html = $(id).html();
    return html.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}
var SongDetailManager = (function () {
    function SongDetailManager() {
        this.menuHidden = true;
    }
    SongDetailManager.prototype.bind = function () {
        this.menuWidth = $("#songDetailContainer").width();
        this.menuHeight = $("#songDetailContainer").height();
        this.bindHover();
    };
    SongDetailManager.prototype.showDetails = function (options, detailCallback, bioUrl, position) {
        this.menuHidden = false;
        $("#songDetailMenuCell").empty();
        options.forEach(function (option) {
            var optionTemplate = template("#songDetailOptionTemplate", option);
            $("#songDetailMenuCell").append(optionTemplate);
        });
        this.updateLayout(position);
        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;
        this.loadBio(bioUrl);
    };
    SongDetailManager.prototype.updateLayout = function (position) {
        $("#songDetailContainer").css("left", this.hasSpaceOnRight(position.x) ? position.x : (position.x - this.menuWidth)).css("top", this.hasSpaceOnBottom(position.y) ? position.y : (position.y - this.menuHeight)).show(300);
        $("#songDetailMenuCell").css(this.hasSpaceOnBottom(position.y) ? "top" : "bottom", 0).css(this.hasSpaceOnBottom(position.y) ? "bottom" : "top", "auto").css(this.hasSpaceOnRight(position.x) ? "left" : "right", 0).css(this.hasSpaceOnRight(position.x) ? "right" : "left", "auto").css("float", this.hasSpaceOnRight(position.x) ? "left" : "right");
        $("#songDetailBioCell").css("float", this.hasSpaceOnRight(position.x) ? "right" : "left");
    };
    SongDetailManager.prototype.loadBio = function (url) {
        $("#songDetailBioCell").load(url);
    };
    SongDetailManager.prototype.bindHover = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if(_this.menuHidden) {
                return;
            }
            if(event.clientX < _this.menuX || event.clientX > (_this.menuX + _this.menuWidth) || event.clientY < _this.menuY || event.clientY > (_this.menuY + _this.menuHeight)) {
                $("#songDetailContainer").hide(300);
                _this.menuHidden = true;
            }
        });
    };
    SongDetailManager.prototype.hasSpaceOnRight = function (x) {
        return x + this.menuWidth < Dimensions.windowWidth || x < this.menuWidth;
    };
    SongDetailManager.prototype.hasSpaceOnBottom = function (y) {
        return y + this.menuHeight < Dimensions.windowHeight || y < this.menuHeight;
    };
    return SongDetailManager;
})();
var songDetailManager = new SongDetailManager();
//@ sourceMappingURL=common.js.map