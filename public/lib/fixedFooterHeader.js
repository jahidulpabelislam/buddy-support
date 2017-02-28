//expands height of section to create sticky footer
const expandSection = function() {
    "use strict";

    $("#chatButtons").css("top", $(".navbar-header").outerHeight(true) + 10 + "px");

    //sets the header to be positioned lower than fixed nav (to fix issue with Bootstrap fixed navs)
    $("#startContainer").css("margin-top", $(".navbar-header").outerHeight(true) + 10 + "px");
    $("#startContainer").css("margin-bottom", $("#messageForm").outerHeight(true) + 10 + "px");

    $("#chat").css("margin-top", $(".navbar-header").outerHeight(true) + $("#chatButtons").outerHeight(true) + 10 + "px");
    $("#chat").css("margin-bottom", $("#messageForm").outerHeight(true) + 10 + "px");

    //makes section default height to work out if content is too small or big
    $("section").height("auto");

    var height = $("#startContainer").outerHeight(true);

    //checks if default height of content is shorter than screen height
    if (height < $(window).height()) {

        //section is extended to fill the difference
        $("#startContainer").height(($(window).height() - height) + $("#startContainer").height());
    }
};

window.addEventListener("load", expandSection);
window.addEventListener("orientationchange", expandSection);
window.addEventListener("resize", expandSection);
