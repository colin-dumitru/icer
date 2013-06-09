var lastScrollY = 0;
var sections = [0, 1, 2, 3, 4, 5, 6];
var currentSection = 0;
var sectionOffset = [];

function load() {
    document.addEventListener('scroll', onScroll);

    sections.forEach(function(s) {
        sectionOffset[s] = $("#section" + s).position().top;
    });

    $(".headerButton").click(function() {
        var section = parseInt($(this).attr("id").substr(12));
        $("body").scrollTop(sectionOffset[section])
    });

    changeSection(0);
}

function onScroll() {
    handleHeaderScroll();
    handleSectionScroll();
}

function handleHeaderScroll() {
    if (window.scrollY >= 80 && lastScrollY < 80) {
        $("#header").addClass("fixedHeader");
    } else if(window.scrollY < 80) {
        $("#header").removeClass("fixedHeader");
    }
    lastScrollY = window.scrollY;
}

function handleSectionScroll() {
    var section = 0;

    sections.forEach(function(s) {
        if(window.scrollY > sectionOffset[s] - 150) {
            section = Math.max(0, s);
        }
    });

    if(section != currentSection) {
        changeSection(section);
    }
    currentSection = section;
}

function changeSection(section) {
    $("#headerButton" + currentSection).removeClass("headerButtonSelected");
    $("#headerButton" + section).addClass("headerButtonSelected");

    $("#resourceContent" + currentSection).removeClass("resourceContentDisplayed");
    $("#resourceContent" + section).addClass("resourceContentDisplayed");

}