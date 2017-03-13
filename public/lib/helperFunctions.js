//sets up the months to be used later
var months = {
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December"
    },

    //sets up the days to be used later
    days = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"},

    //function to get the date endings
    getDateEnding = function(date) {
        var j = date % 10,
            k = date % 100;

        if (j === 1 && k !== 11) {
            return date + "st";
        } else if (j === 2 && k !== 12) {
            return date + "nd";
        } else if (j === 3 && k !== 13) {
            return date + "rd";
        }

        return date + "th";

    };