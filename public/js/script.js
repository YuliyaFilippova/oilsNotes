


$(function(){

	function modalProp() {
		$('.modal-add').draggable();
		$('.modal-add').resizable({
			minHeight: 550,
			minWidth: 500,
		});

		$('.modal-add-blend').draggable();
		$('.modal-add-blend').resizable({
			minHeight: 550,
			minWidth: 500,
		});
	}

	$('.add').on('click', function () {
		$('.modal-add').css({ "display": "block" });
		modalProp();
	});

	$('.add-blend').on('click', function () {
		$('.modal-add-blend').css({ "display": "block" });
		modalProp();
	});

	$('.close').on('click', function () {
		$('.modal-add').css({ "display": "none" });
		$('.modal-add-blend').css({ "display": "none" });
	});

	$(document).keydown(function (e) {
		if (e.keyCode == 27) {
			e.preventDefault();
			$('.modal-add').css({ "display": "none" });
			$('.modal-add-blend').css({ "display": "none" });
		}
	});


	// Получение всех пользователей
	function GetUsers() {
		$.ajax({
			url: "/api/users",
			type: "GET",
			contentType: "application/json",
			success: function (users) {
				var rows = "", oils = "";
				users.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

				$.each(users, function (index, user) {
					// добавляем полученные элементы в таблицу
					rows += row(user);
					oils += oilItem(user);
				});

				$(".table tbody").text(" ");
				$(".table tbody").append(rows);
				$('.oils-list tbody').text(" ");
				$('.oils-list tbody').append(oils);
			}
		});
	}

	// Получение одного пользователя
	function GetUser(id) {
		$.ajax({
			url: "/api/users/" + id,
			type: "GET",
			contentType: "application/json",
			success: function (user) {
				reset();
				var form = document.forms["userForm"];
				form.elements["id"].value = user.id;
				form.elements["name"].value = user.name;
				form.elements["note"].value = user.note;
				for (let i = 0; i < user.energetic.length; i++) {
					console.log(user.energetic[i]);
					$("input[value = "+ user.energetic[i] +"]").prop('checked', true);
				}
				form.elements["energetic"].value = user.energetic;
				form.elements["description"].value = user.description;
				//form.elements["file"] = user.pic;
			}
		});
	}
	// Добавление пользователя
	function CreateUser(formData) {
		$.ajax({
			url: "api/users",
			contentType: false,
			processData: false,
			method: "POST",
			data: formData,
			success: function (user) {
				reset();
				console.log(user);
				//$(".table tbody").append(row(user));
				$('.oils-list tbody').append(oilItem(user));
			}
		})
	}
	// Изменение пользователя
	function EditUser(formData) {
		$.ajax({
			url: "api/users",
			contentType: false,
			processData: false,
			method: "PUT",
			data: formData,
			success: function (user) {
				reset();
				console.log('edit here');
				$(".oils-list tr[data-rowid='" + user.id + "']").replaceWith(oilItem(user));
				//$(".table tr[data-rowid='" + user.id + "']").replaceWith(row(user));
				dataDescription(user.id);
			}
		})
	}

	// сброс формы
	function reset() {
		var form = document.forms["userForm"];
		form.reset();
		form.elements["id"].value = 0;
	}

	// Удаление пользователя
	function DeleteUser(id) {
		$.ajax({
			url: "api/users/" + id,
			contentType: "application/json",
			method: "DELETE",
			success: function (user) {
				console.log(user);
				$("tr[data-rowid='" + user.id + "']").remove();
			}
		})
	}
	// создание строки для таблицы
	var row = function (user) {
		return "<tr data-rowid='" + user.id + "'><td>" + user.id + "</td>" +
			"<td>" + user.name + "</td> <td>" + user.note + "</td> <td>" + user.energetic + "</td> <td>" + user.description + "</td>" +
			"<td> <img src= images/" + user.pic + " style = 'height:50px; width:50px' > </td>" +
			"<td><a class='delete' data-id='" + user.id + "'></a></td><td><a class='edit' data-id='" + user.id + "'></a> " +
			"</td></tr>";
	}

	var oilItem = function (user) {
		return "<tr data-rowid='" + user.id + "'><td>" + user.name + "</td> <td><a class='edit' data-id='" + user.id + "'></a></td>" + 
				"<td><a class='delete' data-id='" + user.id + "'></a></td></tr>";
	}

	// сброс значений формы
	$("#reset").click(function (e) {
		e.preventDefault();
		reset();
	})

	// отправка формы
	$("form").submit(function (e) {
		e.preventDefault();
		formData = new FormData($(this).get(0));
		var id = this.elements["id"].value;
		if (id == 0) {
			CreateUser(formData);
			$('.modal-add').css({ "display": "none" });
			GetUsers();
		}
		else {
			EditUser(formData);
			$('.modal-add').css({ "display": "none" });
		}
	});

	// нажимаем на ссылку Изменить
	$("body").on("click", ".edit", function () {
		var id = $(this).data("id");
		console.log(id);
		$('.modal-add').css({ "display": "block" });
		modalProp();
		GetUser(id);
	})
	// нажимаем на ссылку Удалить
	$("body").on("click", ".delete", function () {
		var id = $(this).data("id");
		DeleteUser(id);
		GetUsers();
	})

	$("body").on("click", "tr", function () {
		var id = $(this).data("rowid");
		dataDescription(id);
	})

	// Получение одного пользователя
	function dataDescription(id) {
		$.ajax({
			url: "/api/users/" + id,
			type: "GET",
			contentType: "application/json",
			success: function (user) {
				$('.oilPhoto').text(" "); // сброс предыдущих свойств
				$('.oilEnergy span').text(" "); // сброс предыдущих свойств
				$('.oilPhoto').append("<img src= images/" + user.pic + " >");
				$('.oilName span').text(user.name);
				var notes = {
					1: "Нижняя", 
					2: "Средняя", 
					3: "Верхняя"
				};
				$('.oilNote span').text(notes[+user.note]);
				var energetics = {
					1: "Согревающая",
					2: "Охлаждающая",
					3: "Увлажняющая", 
					4: "Сушащая"
				};
				$.each(user.energetic, function (index, item){
					if (item in energetics) {
						$('.oilEnergy span').append(energetics[+item]+", ");
					}
				}); 
			
				$('.oilDescr span').text(user.description);	
			}
		});
	}

	// загрузка пользователей
	GetUsers();

	// создаем oil base для blend 

	$('<br/><select/>', { "multiple": "" }).appendTo($('.oils-base div'));
	$('<option/>').appendTo($('select')).text(' ');
	$.each($('select'), function (i, ) {
		$(this).attr("name", i);
	});



});
