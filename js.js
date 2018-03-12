$(document).ready(function () {

    var FOOD_DATABASE_KEY = "iLo6AsY2zbirsCYQpoemSIaMb9mNkXTmLyp9Cejj"
    var FOOD = get_from_local_storage("FOOD")
    var SAVED_MEALS = []

    //materialize objects initialisations
    $('.timepicker').timepicker();
    $('.fixed-action-btn').floatingActionButton();
    $('.modal').modal();
    $('.collapsible').collapsible();
    $('.datepicker').datepicker();








    // fonction pour faire des assync call pour les api 
    function httpGetAsync(theUrl, callback, option1, option2) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText, option1, option2);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }


    //fonction qui sauvegarde l'objet dans le storage local.
    function save_to_local_storage(name, the_object) {
        localStorage.setItem(name, JSON.stringify(the_object))
    }

    //fonction qui retourne l'object sauvegarder dans le storage local.
    function get_from_local_storage(name) {
        var tempo = JSON.parse(localStorage.getItem(name))

        if (tempo) {
            for (var i = 0; i < tempo.length; i++) {
                tempo[i].date = new Date(tempo[i].date)
                for (var j = 0; j < tempo[i].data.length; j++) {
                    try {
                        tempo[i].data[j].time = new Date(tempo[i].data[j].time)
                    }
                    catch (error) {
                        console.log(error)
                    }
                }
            }
        } else tempo = [];

        return tempo
    }

    // fonction qui ajoute du data pour les jours spécifique.
    function day_push(date_to_check, food_data) {

        // on cherche dans les date existantes si la date existe on ajoute la valeur.
        for (var i = 0; i < FOOD.length; i++) {
            if (date_to_check.getFullYear() == FOOD[i].date.getFullYear()) {
                if (date_to_check.getMonth() == FOOD[i].date.getMonth()) {
                    if (date_to_check.getDate() == FOOD[i].date.getDate()) {
                        if (food_data) FOOD[i].data.push(food_data)
                        console.log("food apended existing date ", FOOD)
                        save_to_local_storage("FOOD", FOOD)
                        return i;
                    }
                }
            }
        }

        var object_to_append = { date: new Date(date_to_check.getFullYear(), date_to_check.getMonth(), date_to_check.getDate()), data: [] }
        if (food_data) object_to_append.data.push(food_data);

        // si la date n'existe pas et que on doit l'inserrer dans le array (pas la date la lus récente)
        for (var i = 0; i < FOOD.length; i++) {
            if (date_to_check < FOOD[i].date) {
                FOOD.splice(i, 0, object_to_append)
                console.log("food apended non existing date not last", FOOD)
                save_to_local_storage("FOOD", FOOD)
                return i;
            }
        }

        // si la date n<existe pas et que c'est la date la plus récente
        console.log("food apended non existing date last")
        FOOD.push(object_to_append)
        save_to_local_storage("FOOD", FOOD)
        return i
    }


    // actualise les valeur du tableau de daily resume 
    function update_daily_resume() {

    }

    //actualise les valeur du tableau de daily meals 
    function update_daily_meals() {

    }


    //fonction qui liste tout ce qu<il ya dans le local storage.
    function list_all() {

        for (var i in localStorage) {
            console.log(localStorage[i]);
        }
    }


    function search_database(name) {
        httpGetAsync("https://api.nal.usda.gov/ndb/search/?format=json&" + "q=" + name + "&sort=n&max=25&offset=0" + "&api_key=" + FOOD_DATABASE_KEY, search_return)
    }

    function search_return(returned_search) {
        console.log(returned_search)
    }



    function get_nutrition_information(identifier, grams, where) {
        var phrase = ""

        for (var i = 0; i < identifier.length; i++) {
            phrase += "ndbno="
            phrase += identifier[i]
            phrase += "&"
        }

        httpGetAsync("https://api.nal.usda.gov/ndb/V2/reports?" + phrase + "type=f&format=json&api_key=" + FOOD_DATABASE_KEY, nutrition_information_return, grams, where)
    }

    function nutrition_information_return(returned_search, grams, where) {

        var tempo = JSON.parse(returned_search)
        console.log(tempo, grams)
        console.log(tempo.foods[0].food.nutrients)

        console.log(where)

        where.push("lol")
    }

    var meal_data = { name: "meal2", time: new Date(), food_list: [] }

    day_push(new Date(2017, 0, 4))

    console.log(day_push(new Date(2017, 0, 4)))

    get_nutrition_information([45135043, 45135047], 20, meal_data.food_list)





    console.log(meal_data)

});