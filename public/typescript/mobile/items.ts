declare var $;

var itemManager:ItemManager;

function itemsOnLoad() {
    itemManager = new ItemManager();
    itemManager.bind();
}

function itemsOnLoadRadio() {
    itemManager = new ItemManager();
    itemManager.bindRadio();
}

class ItemManager {
    private collapsed = true;
    private itemTable = null;
    private itemList = null;
    public itemListContainer = null;
    private itemContent = null;


    itemAddCallback:(content:string) => void = (id) => {
    };
    itemSelectedCallback:(id:string, label:string) => void = (id, label) => {
    };

    bind() {
        this.itemTable = $("#itemTable");
        this.itemList = $("#itemList");
        this.itemListContainer = $("#itemListContainer");
        this.itemContent = $("#itemContent");

        this.bindItemInput();
        this.bindInitialItems();
    }

    bindRadio() {

        this.itemTable = $("#itemTable");
        this.itemList = $("#itemList");
        this.itemListContainer = $("#itemListContainer");
        this.itemContent = $("#itemContent");

        var container = $("<div> <input id='itemRadioInput'/></div>");
        this.itemContent.append(container);

        this.addRadioItem("RecentSongs", "Recent Songs");
        this.addRadioItem("RecentGenres", "Recent Genres");
        this.addRadioItem("RecentAlbums", "Recent Albums");

        this.bindItemRadioInput();
        this.bindInitialItems();
    }

    private bindInitialItems() {
        var _this = this;

        $(".selectItem").each(function (index, item) {
            var jItem = $(item);
            _this.bindItem(jItem, jItem.attr("itemId"), jItem.text())

        });
    }

    private bindItemInput() {
        var _this = this;

        $("#itemInput").keypress(function (e) {
            if (e.which == 13) {
                _this.itemAddCallback($(this).val());
                $(this).val("");
                _this.takeFocus();
            }
        });
    }


    private bindItemRadioInput() {
        var _this = this;

        $("#itemRadioInput").keypress(function (e) {
            if (e.which == 13) {
                _this.itemAddCallback($(this).val());
                $(this).val("");
                _this.takeFocus();
            }
        });
    }


    public toggle() {
        if (this.collapsed) {
            this.giveFocus();
        } else {
            this.takeFocus();
        }
    }

    private takeFocus() {
        this.collapsed = true;
        this.itemTable.css({
            transform: "translate3d(0,0,0)"
        });
        this.itemListContainer
            .delay(400)
            .hide(0);
    }

    private giveFocus() {
        this.collapsed = false;
        this.itemTable.css({
            transform: "translate3d(-200,0,0)"
        });
        this.itemListContainer
            .show(0);
    }

    public addItem(id:string, title:string) {
        var container = $("<div></div>");

        container.text(title);
        container.addClass("selectItem");
        container.attr("itemId", id);

        this.itemList.append(container);
        this.bindItem(container, id, title);
    }

    public addRadioItem(id:string, title:string) {
        var container = $("<div></div>");

        container.text(title);
        container.addClass("selectItem");
        container.attr("itemId", id);
        this.itemContent.append(container);
        this.bindItem(container, id, title);
    }

    public deleteItem(id:string) {
        $('.selectItem[itemId=' + id + ']').remove()
    }

    private bindItem(container, id:string, label:string) {
        container.click(() => {
            this.itemSelectedCallback(id, label);
            this.takeFocus();
        });
    }

    public loadContent(url:string, callback:() => void) {
        this.itemContent.load(url, callback);
    }

}