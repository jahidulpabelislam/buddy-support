//store months for later use
months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    //sets up the days to be used later
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    getDateEnding = function (date) {
        var j = date % 10,
            k = date % 100;
        if (j === 1 && k !== 11) {
            return date + "st";
        }
        if (j === 2 && k !== 12) {
            return date + "nd";
        }
        if (j === 3 && k !== 13) {
            return date + "rd";
        }
        return date + "th";

    };
