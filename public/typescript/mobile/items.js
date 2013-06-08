var itemManager;
function itemsOnLoad() {
    itemManager = new ItemManager();
    itemManager.bind();
}
var ItemManager = (function () {
    function ItemManager() {
        this.collapsed = true;
        this.itemTable = null;
        this.itemList = null;
        this.itemListContainer = null;
        this.itemContent = null;
        this.itemAddCallback = function (id) {
        };
        this.itemSelectedCallback = function (id, label) {
        };
    }
    ItemManager.prototype.bind = function () {
        this.itemTable = $("#itemTable");
        this.itemList = $("#itemList");
        this.itemListContainer = $("#itemListContainer");
        this.itemContent = $("#itemContent");
        this.bindItemInput();
        this.bindInitialItems();
    };
    ItemManager.prototype.bindInitialItems = function () {
        var _this = this;
        $(".selectItem").each(function (index, item) {
            var jItem = $(item);
            _this.bindItem(jItem, jItem.attr("itemId"), jItem.text());
        });
    };
    ItemManager.prototype.bindItemInput = function () {
        var _this = this;
        $("#itemInput").keypress(function (e) {
            if(e.which == 13) {
                _this.itemAddCallback($(this).val());
                $(this).val("");
                _this.takeFocus();
            }
        });
    };
    ItemManager.prototype.toggle = function () {
        if(this.collapsed) {
            this.giveFocus();
        } else {
            this.takeFocus();
        }
    };
    ItemManager.prototype.takeFocus = function () {
        this.collapsed = true;
        this.itemTable.css({
            transform: "translate3d(0,0,0)"
        });
        this.itemListContainer.delay(400).hide(0);
    };
    ItemManager.prototype.giveFocus = function () {
        this.collapsed = false;
        this.itemTable.css({
            transform: "translate3d(-200,0,0)"
        });
        this.itemListContainer.show(0);
    };
    ItemManager.prototype.addItem = function (id, title) {
        var container = $("<div></div>");
        container.text(title);
        container.addClass("selectItem");
        container.attr("itemId", id);
        this.itemList.append(container);
        this.bindItem(container, id, title);
    };
    ItemManager.prototype.deleteItem = function (id) {
        $('.selectItem[itemId=' + id + ']').remove();
    };
    ItemManager.prototype.bindItem = function (container, id, label) {
        var _this = this;
        container.click(function () {
            _this.itemSelectedCallback(id, label);
            _this.takeFocus();
        });
    };
    ItemManager.prototype.loadContent = function (url, callback) {
        this.itemContent.load(url, callback);
    };
    return ItemManager;
})();
//@ sourceMappingURL=items.js.map
