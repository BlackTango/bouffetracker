$(document).ready(function () {

    var FOOD_DATABASE_KEY = "iLo6AsY2zbirsCYQpoemSIaMb9mNkXTmLyp9Cejj"
    var FOOD = get_from_local_storage("FOOD")
    var SAVED_MEALS = []

    //meal add variables
    var meal_list = [];
    var search_result;
    var meal_data;

    //materialize objects initialisations
    $('.timepicker').timepicker();
    $('.fixed-action-btn').floatingActionButton();
    $('.modal').modal();
    $('.collapsible').collapsible();
    $('.datepicker').datepicker();
    $('input#input_text, textarea#textarea2').characterCounter();



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
        console.log("food apended non existing date last", FOOD)
        FOOD.push(object_to_append)
        save_to_local_storage("FOOD", FOOD)
        return i
    }


    // actualise les valeur du tableau de daily resume 
    function update_daily_resume() {

    }

    //actualise les valeur du tableau de daily meals 
    function update_daily_meals() {

        console.log("lol")

        var index = null

        for (var i = 0; i < FOOD.length; i++) {
            if (FOOD[i].date.toString() == new Date(new Date().setHours(0, 0, 0, 0)).toString()) index = i;
        }
        console.log(index)

        if (!index) return;


        $('#daily_meals').empty();

        for (var i = 0; i < FOOD[index].data.length; i++) {
            $('#daily_meals').append('<tr><td>' + FOOD[index].data[i].name + '</td><td><a class="btn-floating btn-medium waves-effect waves-light red s2"><i id="' + i + '_daily_meals" class="material-icons">edit</i></a></td></tr>')
        }

    }


    //fonction qui liste tout ce qu<il ya dans le local storage.
    function list_all() {

        for (var i in localStorage) {
            console.log(localStorage[i]);
        }
    }


    // toutes les fonctions en rapport avec le search ( dans le meal add)
    //******************************************************************************** */

    $('#new_search').click(function a() {
        console.log("lol")
        $('#search_request_input').focus();
    });

    $('#send_search_request').click(function a() {
        search_database($('#search_request_input').val());
    });


    function search_database(name) {
        httpGetAsync("https://api.nal.usda.gov/ndb/search/?format=json&" + "q=" + name + "&sort=n&max=25&offset=0" + "&api_key=" + FOOD_DATABASE_KEY, search_return)
    }

    function search_return(returned_search) {


        var temp = JSON.parse(returned_search)
        if (!temp.errors) {


            search_result = temp.list.item;
            console.log(search_result)

            $('#search_result_table').empty();

            for (var i = 0; i < search_result.length; i++) {
                $('#search_result_table').append('<tr><td>' + search_result[i].name + '</td><td><a class="btn-floating btn-medium waves-effect waves-light red s2"><i id="' + i + ' search" class="material-icons">add</i></a></td></tr>')
            }

        }
    }

    $('#search_result_table').on("click", function () {
        if (event.target.id) {

            var id = event.target.id
            var id = parseInt(id)

            meal_list.push({ "item": search_result[id], "quantity": 0, "food": {} })
            console.log(meal_list)



            update_meal_list()

            $('#search').modal('close');

        }
    });


    function update_meal_list() {
        $('#meal_item_list').empty();

        for (var i = 0; i < meal_list.length; i++) {
            $('#meal_item_list').append('<tr><td><p>' + meal_list[i].item.name + '</p></td><td><input placeholder="Quantity (g)" id="' + i + 'quantity" type="number" min="0" value="0" class="validate"></td><td><a class="btn-floating btn-medium waves-effect waves-light red"><i id="' + i + ' delete" class="material-icons">delete</i></a></td></tr>')
        }
    }

    //fait en sorte que quand on pese sur enter, ca fonctionne
    $("#search_request_input").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#send_search_request").click();
        }
    });

    //******************************************************************************** */
    //*************************************************************
    //***********************************************
    //**********************************




    // toutes les fonctions en rapport avec le meal add
    //******************************************************************************** */

    $('#save_meal').click(function a() {

        for (var i = 0; i < meal_list.length; i++) {
            var temp = '#' + i + 'quantity'
            meal_list[i].quantity = $(temp).val();
        }


        var id_list = []
        for (var i = 0; i < meal_list.length; i++) {
            id_list.push(meal_list[i].item.ndbno)
        }


        var day;
        if ($('#date').val()) {
            if ($('#time').val()) {
                day = new Date(Date.parse($('#date').val() + " " + $('#time').val()))
            } else {
                day = new Date(Date.parse($('#date').val() + " 00:00"))
            }
        } else day = new Date()

        meal_data = { "name": $('#food_name').val(), "date": day, "meal_list_info": [] }

        var temp_aray = []

        for (var i = 0; i < meal_list.length; i++) {
            temp_aray.push(meal_list[i].item.ndbno)
        }

        console.log(temp_aray)

        $('#main_page_update').empty();
        $('#main_page_update').append('<div class="indeterminate"></div>');


        get_nutrition_information(temp_aray)



    });


    $('#meal_item_list').on("click", function () {

        var id = event.target.id

        if (id.includes("delete")) {
            var id = parseInt(id)
            meal_list.splice(id, 1);
            update_meal_list()
        }


    });


    function get_nutrition_information(identifier) {

        if (!identifier) {
            $('#main_page_update').empty();
            return
        }

        if (!identifier.length) {
            $('#main_page_update').empty();
            return
        }


        var phrase = ""

        for (var i = 0; i < identifier.length; i++) {
            phrase += "ndbno="
            phrase += identifier[i]
            phrase += "&"
        }

        httpGetAsync("https://api.nal.usda.gov/ndb/V2/reports?" + phrase + "type=f&format=json&api_key=" + FOOD_DATABASE_KEY, nutrition_information_return)
    }

    function nutrition_information_return(returned_search) {
        var tempo = JSON.parse(returned_search)

        var info = { "description": null, "nutrient": null, "quantity": 0 }

        console.log(meal_list.length)

        for (var i = 0; i < meal_list.length; i++) {
            info = { "description": tempo.foods[0].food.desc, "nutrient": tempo.foods[0].food.nutrients, "quantity": meal_list[i].quantity }
            meal_data.meal_list_info.push(info);
        }
        console.log(info)
        console.log(tempo)
        console.log(meal_data)
        //console.log(tempo.foods[0].food.nutrients)
        //console.log(tempo.foods[0].foods)

        day_push(new Date(), meal_data)

        $('#main_page_update').empty();

        update_daily_resume()
        update_daily_meals()

    }






    //******************************************************************************** */
    //*************************************************************
    //***********************************************
    //**********************************








    var meal_data = { name: "meal2", time: new Date(), food_list: [] }

    //console.log(FOOD)

    // get_nutrition_information([45078606])


    console.log(FOOD)

    console.log(new Date(new Date().setHours(0, 0, 0, 0)))

    update_daily_meals()


});