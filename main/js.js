$(document).ready(function () {

    var FOOD_DATABASE_KEY = "iLo6AsY2zbirsCYQpoemSIaMb9mNkXTmLyp9Cejj"
    var FOOD = get_food_from_local_storage("FOOD")
    var SAVED_MEALS = get_food_from_local_storage("SAVED_MEALS")
    var SAVED_DAY = get_food_from_local_storage("SAVED_DAY")
    var SAVED_SHEDULE = get_food_from_local_storage("SAVED_SHEDULE")

    //meal edit indexes and variable
    var IS_INSIDE_EDIT = false;
    var DAILY_MEAL_INDEX;
    var TODAY_INDEX = -1;

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


    //initialise animation on scroll 
    AOS.init();




    //initialisation

    for (var i = 0; i < FOOD.length; i++) {
        if (FOOD[i].date.toString() == new Date(new Date().setHours(0, 0, 0, 0)).toString()) TODAY_INDEX = i;
    }




    console.log(TODAY_INDEX)



    refresh_page()

    $('#day_value').change(function a() {
        //TODAY_INDEX =  $('#day_value').val(FOOD[TODAY_INDEX].date)

        console.log($('#day_value').val())
        console.log(new Date(Date.parse($('#day_value').val() + " 00:00")))

        TODAY_INDEX = -1

        for (var i = 0; i < FOOD.length; i++) {
            if (FOOD[i].date.toString() == new Date(Date.parse($('#day_value').val() + " 00:00"))) TODAY_INDEX = i
        }

        console.log(TODAY_INDEX)
        refresh_page()
    });


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
    function get_food_from_local_storage(name) {
        var tempo = JSON.parse(localStorage.getItem(name))

        if (name == "FOOD") {
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
        }

        console.log(tempo)

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
                        save_all()
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
                save_all()
                return i;
            }
        }

        // si la date n<existe pas et que c'est la date la plus récente
        console.log("food apended non existing date last", FOOD)
        FOOD.push(object_to_append)
        save_all()
        return i
    }

    function save_all() {
        save_to_local_storage("FOOD", FOOD)
        save_to_local_storage("SAVED_MEALS", SAVED_MEALS)
        save_to_local_storage("SAVED_DAY", SAVED_DAY)
        save_to_local_storage("SAVED_SHEDULE", SAVED_SHEDULE)
    }


    function refresh_page() {
        update_daily_meals()
        update_daily_resume()
        save_all()
    }

    // actualise les valeur du tableau de daily resume 
    function update_daily_resume() {

        $('#daily_resume').empty();

        if (TODAY_INDEX < 0) {
            console.log("cant update daily nutrition")
        }

        var protein = 0
        var carb = 0
        var cal = 0
        var fat_trans = 0
        var fat_sat = 0
        var sugar = 0

        if (TODAY_INDEX >= 0) {

            if (TODAY_INDEX != -1) {
                for (var i = 0; i < FOOD[TODAY_INDEX].data.length; i++) {
                    for (var j = 0; j < FOOD[TODAY_INDEX].data[i].meal_list_info.length; j++) {
                        for (var k = 0; k < FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient.length; k++) {
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Protein") protein += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Energy" && FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].unit == "kcal") cal += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Carbohydrate, by difference") carb += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Fatty acids, total trans") fat_trans += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Fatty acids, total saturated") fat_sat += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100
                            if (FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].name == "Sugars, total") sugar += FOOD[TODAY_INDEX].data[i].meal_list_info[j].quantity * FOOD[TODAY_INDEX].data[i].meal_list_info[j].nutrient[k].value / 100

                        }
                    }
                }
            }
        }

        protein = protein.toFixed(2)
        carb = carb.toFixed(2)
        cal = cal.toFixed(2)
        fat_trans = fat_trans.toFixed(2)
        fat_sat = fat_sat.toFixed(2)
        sugar = sugar.toFixed(2)

        protein += " g"
        carb += " g"
        cal += " kcal"
        fat_trans += " g"
        fat_sat += " g"
        sugar += " g"



        $('#daily_resume').append('<tr><td>' + cal + '</td><td>' + protein + '</td><td>' + carb + '</td><td>' + fat_trans + '</td><td>' + fat_sat + '</td><td>' + sugar + '</td></tr>');



    }

    //actualise les valeur du tableau de daily meals 
    function update_daily_meals() {

        $('#daily_meals').empty();

        if (TODAY_INDEX < 0) {
            console.log("cant update daily resume")
            return
        }

        var index = null



        for (var i = 0; i < FOOD[TODAY_INDEX].data.length; i++) {
            console.log(FOOD[TODAY_INDEX].data[i].time)
            console.log(FOOD[TODAY_INDEX].data[i].time < new Date())
            $('#daily_meals').append('<tr><td>' + FOOD[TODAY_INDEX].data[i].name + '</td><td><a class="btn-floating btn-medium waves-effect waves-light red s2 modal-trigger" href="#edit_daily_meal"><i id="' + i + '_daily_meals"  class="material-icons">edit</i></a></td></tr>')
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

    $('#send_search_request').click(function a() {
        search_database($('#search_request_input').val());
        $('#search_result_table').empty()
        $('#search_modal_update').empty();
        $('#search_modal_update').append('<div class="progress"><div class="indeterminate"></div></div>');

    });


    function search_database(name) {

        var a = ""

        if ($('#food_database_check').is(':checked')) a += "&ds=Standard Reference"
        console.log(a)

        httpGetAsync("https://api.nal.usda.gov/ndb/search/?format=json&" + "q=" + name + "&sort=r&max=50&offset=0" + a + "&api_key=" + FOOD_DATABASE_KEY, search_return)
    }

    function search_return(returned_search) {

        $('#search_modal_update').empty();

        var temp = JSON.parse(returned_search)
        if (!temp.errors) {


            search_result = temp.list.item;
            console.log(search_result)

            $('#search_result_table').empty();

            for (var i = 0; i < search_result.length; i++) {
                $('#search_result_table').append('<tr><td>' + search_result[i].name + '</td><td><a class="btn-floating btn-medium waves-effect waves-light red s2"><i id="' + i + '_search" class="material-icons">add</i></a></td></tr>')
            }

        }
    }


    $('#send_search_request_meal_edit').on("click", function () {
        IS_INSIDE_EDIT = true;
    });


    $('#search_result_table').on("click", function () {

        if (event.target.id) {

            var id = event.target.id
            var id = parseInt(id)

            if (IS_INSIDE_EDIT) {
                console.log("qhy are you inside")
                console.log("iside edit ", FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info)
                console.log(search_result[id].ndbno)
                get_nutrition_information([search_result[id].ndbno])
                $('#search').modal('close');
            } if (!IS_INSIDE_EDIT) {

                meal_list.push({ "item": search_result[id], "quantity": 0, "food": {} })
                console.log(meal_list)


                update_meal_list()

                $('#search').modal('close');
            }


        }
    });


    function update_meal_list() {
        console.log("dans le update")

        console.log(meal_list.length)

        for (var j = 0; j < meal_list.length; j++) {

            var temp = '#' + j + 'quantity'
            meal_list[j].quantity = $(temp).val()

        }

        $('#meal_item_list').empty();

        for (var i = 0; i < meal_list.length; i++) {
            var temp = 0
            console.log(meal_list[i])
            if (meal_list[i].quantity) temp = meal_list[i].quantity
            $('#meal_item_list').append('<tr><td><p>' + meal_list[i].item.name + '</p></td><td><input placeholder="Quantity (g)" id="' + i + 'quantity" type="number" min="0" value="' + temp + '" class="validate"></td><td><a class="btn-floating btn-medium waves-effect waves-light red"><i id="' + i + ' delete" class="material-icons">delete</i></a></td></tr>')
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
            meal_list[i].quantity = parseInt($(temp).val());
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
        } else if ($('#time').val()) {
            var temp = new Date();
            day = new Date(temp.getFullYear() + "-" + (temp.getMonth() + 1) + "-" + temp.getDate() + " " + $('#time').val());
        } else day = new Date();

        console.log(day)


        meal_data = { "name": $('#food_name').val(), "time": day, "meal_list_info": [] }

        var temp_aray = []

        for (var i = 0; i < meal_list.length; i++) {
            temp_aray.push(meal_list[i].item.ndbno)
        }

        $('#main_page_update').empty();
        $('#main_page_update').append('<div class="progress"><div class="indeterminate"></div></div>');

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

        console.log(tempo)
        var info = { "description": null, "nutrient": null, "quantity": 0 }

        if (IS_INSIDE_EDIT) {
            console.log(tempo)
            console.log(FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info)

            info.description = tempo.foods[0].food.desc
            info.nutrient = tempo.foods[0].food.nutrients
            info.quantity = 0

            FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info.push(info)
            update_edit_meal()
            IS_INSIDE_EDIT = false;
            return
        }

        console.log(meal_list.length)

        for (var i = 0; i < tempo.foods.length; i++) {
            info = { "description": tempo.foods[i].food.desc, "nutrient": tempo.foods[i].food.nutrients, "quantity": meal_list[i].quantity }
            meal_data.meal_list_info.push(info);
        }

        console.log(FOOD)
        console.log(meal_data)

        day_push(meal_data.time, meal_data)

        SAVED_MEALS.push(meal_data)
        console.log(SAVED_MEALS)

        $('#main_page_update').empty();

        meal_list = []
        update_meal_list()

        refresh_page()

    }

    //******************************************************************************** */
    //*************************************************************
    //***********************************************
    //**********************************

    // toutes les fonctions en rapport avec le edit meal 
    //******************************************************************************** */


    $('#daily_meals').on("click", function () {

        DAILY_MEAL_INDEX = event.target.id

        if (DAILY_MEAL_INDEX.includes("_daily_meals")) {

            DAILY_MEAL_INDEX = parseInt(DAILY_MEAL_INDEX)
            console.log(DAILY_MEAL_INDEX)

            update_edit_meal()
        }

    });

    function update_edit_meal() {
        $('#daily_meal_info').empty();

        var minute_compensate = "0";
        if (FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time.getMinutes() < 10) minute_compensate += FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time.getMinutes()
        else minute_compensate = FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time.getMinutes()

        var name = FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].name
        var time = FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time.getHours() + ":" + minute_compensate

        console.log(time)

        $('#edit_meal_name').val(name);
        $('#edit_meal_time').val(time);


        for (var i = 0; i < FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info.length; i++) {

            var temp = '<div class="center"><a class="btn-floating btn-medium waves-effect waves-light deep-purple darken-3 s2"><i id="' + i + '_delete_meal_edit" class="material-icons">delete</i></a></div><table><thead><tr><th>Name</th><th>Curent value</th></tr></thead><tbody>';

            console.log(FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].nutrient.length)
            for (var j = 0; j < FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].nutrient.length; j++) {
                temp += span_maker(FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].nutrient[j].name, (FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].quantity * FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].nutrient[j].value / 100).toFixed(4) + " " + FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].nutrient[j].unit)
            }

            temp += " </tbody></table>"


            $('#daily_meal_info').append('<li><div class="collapsible-header">' + FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].description.name + '</div><div class="collapsible-body"><input placeholder="Quantity (g)" id="' + i + '_edit_meal_quantity" type="number" min="0" value="' + FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].quantity + '" class="validate">' + temp + '</div></li>');
        }
    }

    function span_maker(description, value) {
        return "<tr>" + "<td>" + description + "</td>" + "<td>" + value + "</td>" + "</tr>"
    }

    $('#daily_meal_edit_delete').click(function a() {

        FOOD[TODAY_INDEX].data.splice(DAILY_MEAL_INDEX, 1)
        save_to_local_storage("FOOD", FOOD)
        refresh_page()

    });


    $('#daily_meal_edit_save').click(function a() {
        var temp = new Date();

        console.log("save", FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX])
        console.log(new Date(temp.getFullYear() + "-" + (temp.getMonth() + 1) + "-" + temp.getDate() + " " + $('#edit_meal_time').val()))

        console.log(FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time)

        FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].name = $('#edit_meal_name').val();
        FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].time = new Date(temp.getFullYear() + "-" + (temp.getMonth() + 1) + "-" + temp.getDate() + " " + $('#edit_meal_time').val());

        console.log(parseInt($("#" + DAILY_MEAL_INDEX + "_edit_meal_quantity").val()))

        console.log(FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[0])

        for (var i = 0; i < FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info.length; i++) {

            FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info[i].quantity = parseInt($("#" + i + "_edit_meal_quantity").val())
        }


        save_to_local_storage("FOOD", FOOD)
        refresh_page()

    });



    $('#daily_meal_info').on("click", function () {

        id = event.target.id

        if (id.includes("_delete_meal_edit")) {

            console.log("lol")

            id = parseInt(id)
            console.log(id)


            FOOD[TODAY_INDEX].data[DAILY_MEAL_INDEX].meal_list_info.splice(id, 1);

            update_edit_meal()

        }
    });

    //******************************************************************************** */
    //*************************************************************
    //***********************************************
    //**********************************


    var meal_data = { name: "meal2", time: new Date(), food_list: [] }

    //console.log(FOOD)

    // get_nutrition_information([45078606])


    console.log(FOOD)



    console.log(SAVED_MEALS)
});