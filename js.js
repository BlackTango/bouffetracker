$(document).ready(function () {

    var FOOD_DATABASE_KEY = "iLo6AsY2zbirsCYQpoemSIaMb9mNkXTmLyp9Cejj"
    var FOOD=[10,10,10,10];

    function api_test(food){
        foood = JSON.parse(food);
        console.log(foood)
    }


    // fonction pour faire des assync call pour les api 
    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    console.log("lol")

    httpGetAsync("https://api.nal.usda.gov/ndb/reports/?ndbno=01009&type=f&format=json&api_key="+FOOD_DATABASE_KEY,api_test)

    //localStorage.setItem("food",JSON.stringify(FOOD))
    console.log(JSON.parse(localStorage.getItem("food")))
    //localStorage.removeItem("food")

    function save_to_local_storage(the_object){
        localStorage.removeItem("food")
        localStorage.setItem("food",JSON.stringify(the_object))
    }

    function get_from_local_storage(){
        return JSON.parse(localStorage("food"))
    }



});
