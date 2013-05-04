declare var $;

var itemManager:ItemManager;

function itemsOnLoad() {
    itemManager = new ItemManager();

    itemManager.bind();
}

class ItemManager {
    private collapsed = true;
    private itemTable = null;
    private itemList = null;
    private itemListContainer = null;
    private itemContent = null;

    itemAddCallback:(content:string) => void = (id) => {
    };
    itemSelectedCallback:(id:string) => void = (id) => {
    };

    bind() {
        this.itemTable = $("#itemTable");
        this.itemList = $("#itemList");
        this.itemListContainer = $("#itemListContainer");
        this.itemContent = $("#itemContent");

        var _this = this;

        $("#itemInput").keypress(function (e) {
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
            marginLeft: 0
        });
        this.itemListContainer
            .delay(400)
            .hide(0);
    }

    private giveFocus() {
        this.collapsed = false;
        this.itemTable.css({
            marginLeft: -200
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
        this.bindItem(container, id);
    }

    private bindItem(container, id:string) {
        container.click(() => {
            this.itemSelectedCallback(id);
            this.takeFocus();
        });
    }

    public loadContent(url:string, callback:() => void) {
        this.itemContent.load(url, callback);
    }

}