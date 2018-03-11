$(document).ready(function () {

    var FOOD_DATABASE_KEY = "iLo6AsY2zbirsCYQpoemSIaMb9mNkXTmLyp9Cejj"
    var FOOD = get_from_local_storage("FOOD")





    // materialize objects initialisations
    $('.timepicker').timepicker();






    function api_test(food) {
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
                    tempo[i].data[j].time = new Date(tempo[i].data[j].time)
                }
            }
        } else tempo = [];

        return tempo
    }

    // fonction qui ajoute du data pour les jours spécifique.
    function day_push(date_to_check, food_data) {

        console.log(date_to_check.getFullYear())

        // on cherche dans les date existantes si la date existe on ajoute la valeur.
        for (var i = 0; i < FOOD.length; i++) {
            if (date_to_check.getFullYear() == FOOD[i].date.getFullYear()) {
                if (date_to_check.getMonth() == FOOD[i].date.getMonth()) {
                    if (date_to_check.getDate() == FOOD[i].date.getDate()) {
                        FOOD[i].data.push(food_data)
                        console.log("food apended existing date ", FOOD)
                        save_to_local_storage("FOOD", FOOD)
                        return;
                    }
                }
            }
        }

        var object_to_append = { date: new Date(date_to_check.getFullYear(), date_to_check.getMonth(), date_to_check.getDate()), data: [food_data] }

        // si la date n'existe pas et que on doit l'inserrer dans le array (pas la date la lus récente)
        for (var i = 0; i < FOOD.length; i++) {
            if (date_to_check < FOOD[i].date) {
                FOOD.splice(i, 0, object_to_append)
                console.log("food apended non existing date not last", FOOD)
                save_to_local_storage("FOOD", FOOD)
                return;
            }
        }

        // si la date n<existe pas et que c'est la date la plus récente
        console.log("food apended non existing date last")
        FOOD.push(object_to_append)
        save_to_local_storage("FOOD", FOOD)
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

    //https://api.nal.usda.gov/ndb/search/?format=json&&api_key=DEMO_KEY 

    //https://api.nal.usda.gov/ndb/V2/reports?ndbno=01009&ndbno=45202763&ndbno=35193&type=f&format=json&api_key=DEMO_KEY
    //https://api.nal.usda.gov/ndb/search/?format=json&q=butter&sort=n&max=25&offset=0&api_key=DEMO_KEY 

    function get_nutrition_information(identifier) {
        httpGetAsync("https://api.nal.usda.gov/ndb/V2/reports?ndbno=" + identifier + "&type=f&format=json&api_key=" + FOOD_DATABASE_KEY, nutrition_information_return)
    }

    function nutrition_information_return(returned_search) {
        console.log(returned_search)

    }

    var meal_data = { name: "meal2", time: new Date(), food_list: [] }

    day_push(new Date(2017, 0, 3), meal_data)

    get_nutrition_information(45135047)




    //httpGetAsync("https://api.nal.usda.gov/ndb/reports/?ndbno=01009&type=f&format=json&api_key="+FOOD_DATABASE_KEY,api_test)







});