// Setup TypeAhead
var TypeAhead = require('../dist').default;
var typeAhead = new TypeAhead({
  limit: -1, // do not limit # of suggestions
  sorter: null, // do not supply a customer sorter, use the default
  prefixMatch: false // do not restrict suggestions to only prefix matches
});
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

