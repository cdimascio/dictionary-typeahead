#dictionary-typeahead

Easily enable typeahead keyword(s) matching in your web app!

![](https://raw.githubusercontent.com/cdimascio/dictionary-typeahead/master/examples/example-1.gif)
##Install

`npm install dictionary-typeahead`

##Prequisities
Requires promises, thus depending on the browser, a promise polyfill may be required.

##Usage

####ES2016

```
import TypeAhead from ('dictionary-typeahead');
const typeAhead = new TypeAhead();

// Set up a dictionary of keywords
const dictionary = [
  "Yellowstone",
  "Yellowstone National Park",
  "Grand Canyon",
  "Arches",
  "Arches National Park",
  "Yosemite National Park",
  "Yosemite",
  "INYO National Park",
  "INYO"
];

// Ask for suggestions
typeAhead
  .suggest(dictionary, input.value, caretPos)
  .then(suggestions => console.log(suggestions);
```

###ES5

```
// import the module
var TypeAhead = require('dictionary-typeahead').default;
var typeAhead = new TypeAhead();

// Set up a dictionary of keywords
var dictionary = [
  "Yellowstone",
  "Yellowstone National Park",
  "Grand Canyon",
  "Arches",
  "Arches National Park",
  "Yosemite National Park",
  "Yosemite",
  "INYO National Park",
  "INYO"
];

// Ask for suggestions
typeAhead
  .suggest(dictionary, input.value, caretPos)
  .then(suggestions => console.log(suggestions);
```

##Options
 
|Options|default|decription| 
|---|---|---|---|---|
|limit|-1|The number of suggestions to return or -1 to return all|
|sorter|null|a sort function e.g. function(a,b) {return // -1, -, 1}|
|prefixMatch|false|true to match only prefixes, false to return internal matches|
```
const typeAhead = new TypeAhead()
```

is equivalent to:

```
const typeAhead = new TypeAhead({
  limit: -1, // 
  sorter: null, // do not supply a customer sorter, use the default
  prefixMatch: false // do not restrict suggestions to only prefix matches
});
```

##API

|API|description|result| 
|---|---|---|---|---|
|typeAhead.suggest(dictionary, text, caretPosition)   | Given a dictionary of keywords, the user input text, and the user's caret position, find the set of matching suggestions |  returns a `Promise` that resolves with an array of suggestions e.g. `["Super", "Super cool!"]` |
|typeAhead.complete(suggestion, text, caretPosition)  |  Given the the selected suggestion, the input text, and the user's caret position, complete the user's input with the selected suggestion | returns an object containing the text and the suggested 'replace until' position `{"text": "This is Super Cool", "pos": 18}` |
 
##Example
The example code can be found in the examples folder.

###Run It!
From the project root

- `npm install http-server -g`

- `http-server`

- Open browser to http://localhost:8080

- navigate to examples/example-1.html

- Type "hello this is sup" and watch the suggestions appear. 

- Click on a suggestion

###Build It!
`npm run compile-examples`

###View It!
It's super easy to use

###index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Example 1</title>
</head>
<body>
<input id="textInput" type="text" />
<div id="results" />
<script src="./example-1-webready.js" type="text/javascript"></script>
</body>
</html>
```

###example-1-webready.js
See the examples folder in this project

```
// Setup TypeAhead
var TypeAhead = require('../dist').default;
var typeAhead = new TypeAhead();

// Set up dictionary of keywords for type ahead
var dictionary = [
  "Yellowstone",
  "Yellowstone National Park",
  "Grand Canyon",
  "Arches",
  "Arches National Park",
  "Yosemite National Park",
  "Yosemite",
  "INYO National Park",
  "INYO"
];

// Configure on suggestion click handler
window.suggestionClick = function(suggestion) {
  var input = document.getElementById('textInput');
  var caretPos = input.selectionStart;
  input.value = typeAhead.complete(suggestion, input.value, caretPos).text;
}

// Configure keyup listenener
document.getElementById('textInput').addEventListener("keyup", function(e) {
  var input = document.getElementById("textInput");
  var caretPos = input.selectionStart;
  typeAhead
    .suggest(dictionary, input.value, caretPos)
    .then(matches => {
      var html = matches.map(function(m) {
        return '<div onclick="suggestionClick(\'' + m + '\');">' + m + '</div>';
      }).join('');
      document.getElementById("results").innerHTML = html;
    });
});

```

##License
[MIT](https://opensource.org/licenses/MIT)