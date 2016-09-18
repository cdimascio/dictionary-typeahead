// Setup TypeAhead
var TypeAhead = require('../dist').default;

// Set up dictionary of keywords for type ahead
var dictionary = [
  "Super cool",
  "Super",
  "Typeahead",
  "Type Ahead",
  "Auto Complete is cool"
];

// Configure on suggestion click handler
window.suggestionClick = function(suggestion) {
  var input = document.getElementById('textInput');
  var caretPos = input.selectionStart;
  input.value = TypeAhead.complete(suggestion, input.value, caretPos).text;
}

// Configure keyup listenener
document.getElementById('textInput').addEventListener("keyup", function(e) {
  var input = document.getElementById("textInput");
  var caretPos = input.selectionStart;
  var matches = TypeAhead.suggest(dictionary, input.value, caretPos);
  var html = matches.map(function(m) {
    return '<div onclick="suggestionClick(\'' + m + '\');">' + m + '</div>';
  }).join('');
  document.getElementById("results").innerHTML = html;
});

