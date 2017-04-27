//Expands the height of elements to create sticky footer
const expandSection = function() {
    "use strict";

    //Sets the content to be positioned lower than fixed nav (to fix issue with Bootstrap fixed navs)
    $("#startContainer, #contact, #help").css("margin-top", $(".navbar-header").outerHeight(true) + 10 + "px");
    $("#chatButtons").css("top", $(".navbar-header").outerHeight(true) + 10 + "px");
    $("#chat").css("margin-top", $(".navbar-header").outerHeight(true) + $("#chatButtons").outerHeight(true) + 10 + "px");

    //Leaves space for the message form at the bottom
    $("#chat").css("margin-bottom", $("#messageForm").outerHeight(true) + 10 + "px");
    $("#notificationsContainer").css("margin-bottom", $("#messageForm").outerHeight(true) + 2 + "px");

    //Makes section default height to work out if content is too small or big
    $("#startContainer").height("auto");
    var height = $("#startContainer").outerHeight(true);

    //Checks if default height of content is shorter than screen height
    if (height < $(window).height()) {

        //Start Container is extended to fill the difference
        $("#startContainer").height(($(window).height() - height) + $("#startContainer").height());
    }
};

$(window).on("load orientationchange resize", expandSection);