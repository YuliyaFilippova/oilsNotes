var express = require("express");
var bodyParser = require("body-parser");
const multer  = require("multer");
var fs = require("fs");
 
var app = express();
var jsonParser = bodyParser.json();

app.use(multer({dest:"public/images"}).single("filedata"));
app.use(express.static(__dirname + "/public"));

// получение списка данных
app.get("/api/users", function(req, res){
    var content = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(content);
    res.send(users);
});

// получение одного пользователя по id
app.get("/api/users/:id", function(req, res){
    var id = req.params.id; // получаем id
    var content = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(content);
    var user = null;
    // находим в массиве пользователя по id
    for(var i=0; i<users.length; i++){
        if(users[i].id==id){
            user = users[i];
            break;
        }
    }
    // отправляем пользователя
    if(user){
        res.send(user);
    }
    else{
        res.status(404).send();
    }
});

// получение отправленных данных
app.post("/api/users", jsonParser, function (req, res, next) {
    
    if(!req.body) return res.sendStatus(400);
    
    var userName = req.body.name;
    var userAge = req.body.age;
    var userNote = req.body.note;
    var userEnrg = req.body.energetic;
    var userDesc = req.body.description;
    var userPic = req.file.filename;

    if (!req.file.filename) {
        userPic = "";
    }
    var user = {name: userName, age: userAge, note: userNote, energetic: userEnrg, description: userDesc, pic: userPic};
     
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
     
    // находим максимальный id
    var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    //если пользователей еще нет
    if (id == -Infinity){
        id = 0;
    }

    // увеличиваем его на единицу
    user.id = id+1;
    // добавляем пользователя в массив
    users.push(user);
    var data = JSON.stringify(users);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("users.json", data);
    res.send(user);
});

 // удаление пользователя по id
app.delete("/api/users/:id", function(req, res){
    var id = req.params.id;
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
    var index = -1;

    // находим индекс пользователя в массиве
    for(var i=0; i<users.length; i++){
        if(users[i].id==id){
            index=i;
            break;
        }
    }
    if(index > -1){
        // удаляем пользователя из массива по индексу
        var user = users.splice(index, 1)[0];
        var data = JSON.stringify(users);
        fs.writeFileSync("users.json", data);
        // отправляем удаленного пользователя
        res.send(user);
    }
    else{
        res.status(404).send();
    }
});

// изменение пользователя
app.put("/api/users", jsonParser, function (req, res, next) {

    if (!req.body) return res.sendStatus(400);

    var userId = req.body.id;
    var userName = req.body.name;
    var userAge = req.body.age;
    var userNote = req.body.note;
    var userEnrg = req.body.energetic;
    var userDesc = req.body.description;
    console.log(req.body);
    var userPic;
    if (req.file) {
        userPic = req.file.filename
    }

    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
    var user;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
            user = users[i];
            break;
        }
    }
    // изменяем данные у пользователя
    if (user) {
        user.age = userAge;
        user.name = userName;
        user.note = userNote;
        user.energetic = userEnrg;
        user.description = userDesc;
        //удаляем предыдущую картинку
        if (req.file) {
            fs.unlinkSync("public/images/" + user.pic);
            user.pic = userPic;
        }
        var data = JSON.stringify(users);
        fs.writeFileSync("users.json", data);
        res.send(user);
    }
    else {
        res.status(404).send(user);
    }
});
  
app.listen(3000, function(){
    console.log("Сервер ожидает подключения по адресу http://127.0.0.1:3000");
});