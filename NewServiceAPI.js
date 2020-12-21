"use strict";

// Calling Required Modules
const express = require('express');
const bodyParser = require('body-parser');
// uuid npm module to generate the Unique Identifier Key
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const fetch = require("node-fetch");

// Importing File connected to functionality of ACTIVITY1
var NewsService = require('./NewsService');

const port = process.env.PORT || 3000;
const app = express();

// Reading a HTML FILE which will be sent to the client
let startPageHtml = fs.readFileSync(`${__dirname}/login.html`, 'utf-8');

// Reading out data store file for processing
let JSONstore = fs.readFileSync(`./persistenceStore.json`, 'utf-8');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var newsService = new NewsService();

// Parsing out JSON store
let dataStore = JSON.parse(JSONstore);

let user, key = null, role;
let store = {};

// Create Story - R1
const createStory = function(req, res) {
    console.log(req.body)
    let check = true;
    let title = req.body.title;
    let content = req.body.content;
    let author = user;
    let isPublic = req.body.isPublic;
    let date = req.body.date;
    console.log("title", title, "content", content, author, isPublic, date);
    console.log(typeof(date));
    
    // If DATE doesnt exist, set the current time as data
    if(typeof(date) == "undefined" || date == '') {
        date = new Date().toString();
        console.log(typeof(date), date)
    }
    console.log("title", typeof(title), title)
    if(typeof(title) == "undefined" || title == '') {
        check = false;
    }
    if(typeof(content) == "undefined" || content == '') {
        check = false;
    }
    if(typeof(title) == "undefined" || title == '') {
        check = false;
    }

    let htmlPage = `
    <hr>
    <p>NEWLY CREATED STORY IS:</p>
    <hr>
    <article>
    <h2>${title}</h2>
    <p>${content}</p>
    <h5>By ${author} on ${date}</h5>
    </article>`

    let error = `
    <h3>Something was missing</h3><h4>Search could'nt be done. <NO CONTENT></h4>`

    // Checking valditiy of inputs before passing it
    if(check == false) {
        res.status(404).send(error);
    } else {
        let response = newsService.addStory(title, content, author, isPublic, date);
        console.log('Response', response);
        res.status(201).send(htmlPage);
    }
    console.log(`------ Story Created ------`);
}

// Update (EDIT) Title - R2
const editTitle = function (req, res) {
    let id = req.body.id;
    let newTitle = req.body.title;

    newsService.updateTitle(id, newTitle);
    let htmlPage = `
    <h3>Title Updated</h3><h4>Restart the Server to view changes</h4>`
    res.status(200).send(htmlPage);
    console.log(`------ Title Updated ------`);
}

// Update (edit) Content - R3
const editContent = function(req, res) {
    let id = req.body.id;
    let newContent = req.body.content;
 
    newsService.updateContent(id, newContent);
    let htmlPage = `
    <h3>Content Updated</h3><h4>Restart the Server to view changes</h4>`
    res.status(200).send(htmlPage);
    console.log(`------ Content Updated ------`);
}

// Delete Story - R4
const deleteS = function(req, res) {
    let id = req.body.id;

    newsService.deleteStory(id);
    let htmlPage = `
    <h5>Story Deleted</h5><p>Restart the Server to view changes</p>`
    res.status(200).send(htmlPage);
    console.log(`------ Story Deleted ------`);
}

// Search for story based on certain paramenter - R5
const search = function(req, res) {
    console.log(req.query)
    let titleS = req.query.title;
    let authorS = req.query.author;
    let dateS = req.query.startDate;
    let dateE = req.query.endDate;
    let date = {};
    let dateRange = {};
    let flag = true;
    console.log(titleS, authorS, dateS, dateE)
    let filter = {}, copy;

    if(validateString(authorS) ) {
        filter = Object.assign({}, {"author": authorS})
    }
    if(validateString(titleS) ) {
        if(filter == {}) {
            filter = Object.assign(filter, {"title": titleS});
        } else {
            filter = Object.assign(filter, {"title": titleS});
        }
    }
    if(validateString(dateS)) {
        console.log('here');
        date = Object.assign(date, {"startDate": dateS})
        flag = false;
        if(validateString(dateE)) {
            date = Object.assign(date, {"endDate": dateE})
        }
    } else if(validateString(dateE) && (flag==true)) {
        flag = false;
        date = Object.assign(date, {"endDate": dateE})
    }
    if(flag == false) {
        dateRange = {"dateRange" : date}
    }

    filter = Object.assign(filter, dateRange)
    
    console.log(date)
    console.log(filter)

    let filteredStories = newsService.getStoriesForFilter(filter);
    console.log(filteredStories);
    res.status(200).json({
        "data": filteredStories
    });
}

// Login function - Processed user Name, Role and generates Unique Key
const login = function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let role = req.body.role;

    // Validate Username, then Username and Password
    if(!validateString(username)){
        throw new Error(INVALID_ARGUMENT + " - username");
    } else if(username == password) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        let key = uuidv4();
        console.log("Unique key Identifier:", key);

        // Route to correct endpoint based on ROLE.
        if(role == "guest") {
            setVariables(username, key, role);
            res.writeHead(301, {
                "Location": "http://localhost:3000/viewNews_guest"
            })

        }
        if(role == "author") {
            setVariables(username, key, role);
            res.writeHead(301, {
                "Location": "http://localhost:3000/viewNews_author"
            })
        }
        if(role == "subscriber") {
            setVariables(username, key, role);
            res.writeHead(301, {
                "Location": "http://localhost:3000/viewNews_subscriber"
            })
        }
        res.end()
    } else {
        // If username and password dont match
        let html = 
        `<html>
            <head>
                <title>
                    Error
                </title>
            </head>
            <body>
                <p>ERROR: USERNAME AND PASSWORD DONT MATCH, PLEASE GO BACK  TO LOGIN PAGE</p>
            </body>
        </html>`
        res.send(html);
    }
}

// Renders out HTML page for landing section
const renderStart = (req, res) => {
    res.send(startPageHtml);
}

// Display VIEWNEWS for guest
const viewNews_guest = (req, res) => {
    let lengthofJSON = 0
    let body = '';
    let resMsg = ''

    let resHeader = `<h1>Welcome to VIEWNEWS</h1><h2>User: ${user} - Role: ${role}</h2>`;
    let resLogout = `<input type='submit' onclick='deleteKey()' value='Logout'><br>`;

    // Getting back full data set from search to present data dynamically
    fetch('http://localhost:3000/search')
    .then(res => res.json())
    .then(function(data) {
        store = data;
        lengthofJSON = Object.keys(store.data).length
    })
    .then(function() {
        for(let i = 1; i <= dataStore.LATEST_ID + lengthofJSON; i++){
            if(typeof(store.data[i]) !== "undefined") {
                if (store.data[i].isPublic) {
                    body += `<p id=${i}>${i}  <a href='#' onclick='viewNews_link(${i})'>${store.data[i].title}</a></p>`
                }
                else {
                    body += `<p id=${i}>${i}  ${store.data[i].title}</p>`
                }
            }
        }
    
        let error = '<h1>PLEASE LOGIN IN FIRST BY GOING TO LANDING PAGE</h1>'
        let errorRole = `<h1>YOU ARE NOT A SUBSCRIBER</h1><h4>Login as subscriber</h4>`
        let display = resHeader + resLogout + body + resMsg + '</body></html>'
    
        /*
        *If UNIQUE KEY doenst exist print error, 
        *if login role doesnt match to link print error,
        *else print th page
        */
        if(key == null) {
            res.send(error)
        } else if(role !== "guest") {
            res.send(errorRole)
        } else {
            res.send(display);
        }
    })
}

// Display VIEWNEWS for author
const viewNews_author = (req, res) => {
    let check;
    let lengthofJSON = 0;

    let body = '';
    let resMsg = '';

    let resHeader = `<h1>Welcome to VIEWNEWS</h1><h2>User: ${user} - Role: ${role}</h2>`;
    let resLogout = `<input type='submit' onclick='deleteKey()' value='Logout'><br><br>`;

    // Getting back full data set from search to present data dynamically
    fetch('http://localhost:3000/search')
    .then(res => res.json())
    .then(function(data) {
        store = data;
        lengthofJSON = Object.keys(store.data).length
    })
    .then(function() {
        for(let i = 1; i <= dataStore.LATEST_ID + lengthofJSON; i++){
            if(typeof(store.data[i]) !== "undefined") {
                if((store.data[i].author == `${user}`)) {
                    check = true;
                }
                if (store.data[i].isPublic || (store.data[i].author == `${user}`)) {
                    body += `<p id=${i}>${i}  <a href='#' onclick='viewNews_link(${i})'>${store.data[i].title}</a></p>`
                    if(check) {
                        body += `<div id='deleteStory'><input id='deleteStoryBtn' type='submit' value='Delete Story ${i}'onclick='deleteStoryCall(${i})'></div> `
                        body += `<div id='editContent'><input id='editContentBtn' type='submit' value='Edit Content ${i}' onclick='editContentCall(${i})'></div>`
                        body += `<div id='editTitile'><input id='editTitleBtn' type='submit' value='Edit Title ${i}' onclick='editTitleCall(${i})'></div><div id='displayMessage'></div>`
                    }
                }
                else {
                    body += `<p id=${i}>${i}  ${store.data[i].title}</p>`
                }
            }
            check = false
        }
        
    
        let createStoryButton = `<br><div id='createStory'><input id='createStoryBtn' type='submit' value='CreateStory' onclick='createStoryCall()'></div><br>`
        let display = resHeader + resLogout + body + createStoryButton + resMsg
    
        let error = '<h1>PLEASE LOGIN IN FIRST BY GOING TO LANDING PAGE</h1>'
        let errorRole = `<h1>YOU ARE NOT A AUTHOR</h1><h4>Login as author</h4>`
    
        /*
        *If UNIQUE KEY doenst exist print error, 
        *if login role doesnt match to link print error,
        *else print th page
        */
        if(key == null) {
            res.send(error);
        } else if (role !== 'author') {
            res.send(errorRole);
        } else {
            res.send(display);
        }
    })
}

// Display VIEWNEWS for subscriber
const viewNews_subscriber = (req, res) => {
    let lengthofJSON = 0
    let body = '';
    let resMsg = ''

    let resHeader = `<h1>Welcome to VIEWNEWS</h1><h2>User: ${user} - Role: ${role}</h2>`;
    let resLogout = `<input type='submit' onclick='deleteKey()' value='Logout'><br>`;

    // Getting back full data set from search to present data dynamically
    fetch('http://localhost:3000/search')
    .then(res => res.json())
    .then(function(data) {
        store = data;
        lengthofJSON = Object.keys(store.data).length
    })
    .then(function() {
        for(let i = 1; i <= dataStore.LATEST_ID + lengthofJSON ; i++){
            if(typeof(store.data[i]) !== "undefined") {
                body += `<p id=${i}>${i}  <a href='#' onclick='viewNews_link(${i})'>${store.data[i].title}</a></p>`
            }
        }
    
        let display = resHeader + resLogout + body + resMsg + '</body></html>'
    
        let error = '<h1>PLEASE LOGIN IN FIRST BY GOING TO LANDING PAGE</h1>'
        let errorRole = `<h1>YOU ARE NOT A SUBSCRIBER</h1><h4>Login as subscriber</h4>`
    
        /*
        *If UNIQUE KEY doenst exist print error, 
        *if login role doesnt match to link print error,
        *else print th page
        */
        if(key == null) {
            res.send(error);
        } else if(role !== 'subscriber') {
            res.send(errorRole);
        } else {
            res.send(display);
        }
    })
}

// Submits a from for creating Story
const createStoryForm = (req, res) => {
    let form =
    `<h1>Create Story Form</h1>
        <form>
            <div>
                <label for="title">Title of the story:</label><br>
                <input type="text" id="title" name="title" placeholder="title" required><br><br>
            </div>
            <div>
                <p> Is this story public</p>
                <div>
                    <input type="radio" id="true" name="public" value="true" checked>
                    <label for="true">True</label>
                </div>
                <div>
                    <input type="radio" id="false" name="public" value="false">
                    <label for="false">False</label>
                </div>
                <br>
            </div>
            <div>
                <label for="content">Title of the story:</label><br>
                <textarea id="content" name="content" placeholder="Story" rows="7" cols="70" required></textarea>
                <br><br>
            </div>
            <br><br>
        </form>
        <input type="submit" value="SAVE" onclick='createStoryFromSubmit()'>
        <input type="reset" value="CANCEL" onclick='cancelCreate()'>`
    res.send(form);
}

// Disables the key when LOGOUT is pressed
const removeKeyPath = (req, res) => {
    let message = ''
    removeKey();
    if(key == null) {
        message = 'Unique key Identified Removed'
    }
    console.log("Key has been deleted")
    res.send(message);
}

// Returns a FORM to edit Title
const editTitleForm = (req, res) => {
    let number = req.body.val
    let display = 
    `<h1>Edit TITLE</h1>
        <form>
            <div>
                <label for="title">New Title of the story:</label><br>
                <input type="text" id="title" name="title" placeholder="title" required><br><br>
            </div>
            <br><br>
        </form>
        <input type="submit" value="SAVE" onclick='saveTitle(${number})'>
        <input type="reset" value="CANCEL" onclick='cancelSaveTitle()'>`
    res.send(display);
}

// Returns a FORM to edit Content
const editContentForm = (req, res) => {
    let number = req.body.val
    let display = 
    `<h1>Edit Content</h1>
        <form>
            <div>
                <label for="content">New Content of the story:</label><br>
                <input type="text" id="content" name="content" placeholder="content" required><br><br>
            </div>
            <br><br>
        </form>
        <input type="submit" value="SAVE" onclick='saveContent(${number})'>
        <input type="reset" value="CANCEL" onclick='cancelSaveContent()'>`
    res.send(display);
}

// Displays Stories when hyperlink is clicked
const displayStory = (req, res) => {
    let id = req.body.val;
    let Msg = `<hr><article><h2>${store.data[id].title}</h2>` +
    `<p>${store.data[id].content}<p>` +
    `<h4>By ${store.data[id].author} on ${store.data[id].date}</h4>`
    res.status(200).send(Msg)
}

// ROUTE for R1-R5
app.post('/create', createStory);
app.put('/editTitle', editTitle);
app.put('/editContent', editContent);
app.delete('/delete', deleteS);
app.get('/search', search);

// ROUTE to display LOGIN and VIEWNEWS pages
app.post('/login', login);
app.get('/viewNews_guest', viewNews_guest);
app.get('/viewNews_author', viewNews_author);
app.get('/viewNews_subscriber', viewNews_subscriber);

// ENDPOINT to display FORMS
app.get('/createStoryForm', createStoryForm)
app.get('/editTitleForm', editTitleForm);
app.get('/editContentForm', editContentForm);

// ROUTE for when LOGOUT is clicked
app.get('/removeKey', removeKeyPath);

// ROUTE for Extra Credit FORMS
app.post('/titleCall', editTitleForm)
app.post('/contentCall', editContentForm)

// ROUTE for displaying indiviual sotires
app.post(`/viewNews_link`, displayStory)

// LANDING PAGE
app.get('/', renderStart);

// Listen for a server on a port
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

function validateString(str) {
    return ((str != undefined) && (str != ''))
}

function validateDate(date) {
    // try {
    //     new Date(date).getTime();
    // } catch(err){
    //     return false;
    // }
    // return true;
    if(date == "" || typeof(date) == undefined) {
        return false
    } else {
        return true
    }
}

function setVariables(x, y, z) {
    user = x;
    key = y;
    role = z;
}

function removeKey(x) {
    key = null;
}

function handleError (res, code) {
    res.statuscode = code;
    res.end(`"error": ${http.STATUS_CODES[code]}`);
}