(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DictionaryTypeAhead = function () {
  function DictionaryTypeAhead() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? { limit: -1, sorter: null, prefixMatch: false } : arguments[0];

    _classCallCheck(this, DictionaryTypeAhead);

    this._options = options;
  }

  _createClass(DictionaryTypeAhead, [{
    key: 'suggest',
    value: function suggest(dictionary, text, pos) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!dictionary || !text || text[text.length - 1] === ' ') {
          resolve([]);
        }
        var tokens = _this._tokenize(text.toLowerCase().substring(0, pos));
        var ngrams = _this._ngrams(tokens, 3).reduce(function (acc, tokens) {
          var string = tokens.join(' ').trim();
          if (string) {
            acc.push(string);
          }
          return acc;
        }, []);

        if (ngrams.length === 0) {
          resolve([]);
        }
        var pattern = '(' + ngrams.map(function (n) {
          return _this._escape(n);
        }).join('|') + ')';
        var matches = dictionary.filter(function (i) {
          var p = _this._options.prefixMatch ? '^' : '\\b';
          var re = new RegExp('' + p + pattern + '.*');
          var match = re.exec(i.toLowerCase());
          return match !== null && match !== '';
        });

        var sorter = _this._options.sorter ? _this._options.sorter : _this._sort(ngrams);
        if (_this._options.limit && _this._options.limit > -1) {
          return resolve(matches.slice(0, _this._options.limit).sort(sorter));
        } else {
          return resolve(matches.sort(sorter));
        }
      });
    }
  }, {
    key: 'complete',
    value: function complete(suggestion, text, pos) {
      var tokenBeforeCursor = this._tokenize(text.substring(0, pos), false);
      var tokensAfterCursor = this._tokenize(text.substring(pos, text.length), false);
      var suggestionTokens = this._tokenize(suggestion);

      var suggestionStartIdx = tokenBeforeCursor.length - suggestionTokens.length > -1 ? tokenBeforeCursor.length - suggestionTokens.length : 0;
      var tokensToConsider = tokenBeforeCursor.slice(suggestionStartIdx, tokenBeforeCursor.length);

      var textSuggestion = buildSuggestionTokens(tokensToConsider, suggestionTokens).join(' ');
      var textBeforeSuggestion = tokenBeforeCursor.slice(0, suggestionStartIdx).join(' ');
      var textAfterSuggestion = tokensAfterCursor.join(' ');

      return {
        text: (textBeforeSuggestion + ' ' + textSuggestion + textAfterSuggestion).trim(),
        pos: (textBeforeSuggestion + ' ' + textSuggestion).trim().length
      };

      function buildSuggestionTokens(tokensToConsider, suggestionTokens) {
        var self = this;
        return prefixHelper(tokensToConsider, suggestionTokens);

        function is(a) {
          return { equalTo: function equalTo(b) {
              return a.toLowerCase().trim() === b.toLowerCase().trim();
            } };
        }
        function does(a) {
          return { startWith: function startWith(b) {
              return a.toLowerCase().trim().startsWith(b.toLowerCase().trim());
            } };
        }

        function noPrefixHelper(tokens, sTokens) {
          var res = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

          if (tokens.length > 1) {
            if (sTokens.map(function (s) {
              return s.toLowerCase();
            }).indexOf(tokens[0]) === -1) {
              return noPrefixHelper(tokens.slice(1), sTokens, res.concat(tokens[0]));
            } else {
              return res.concat(sTokens);
            }
          } else {
            return res.concat(sTokens);
          }
        }

        function prefixHelper(tokens, sTokens) {
          var res = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

          if (tokens.length > 1) {
            if (is(tokens[0]).equalTo(sTokens[0])) {
              return prefixHelper(tokens.slice(1), sTokens.slice(1), res.concat(tokens[0]));
            } else {
              return prefixHelper(tokens.slice(1), suggestionTokens, res.concat(tokens[0]));
            }
          } else if (tokens.length === 1) {
            if (does(sTokens[0]).startWith(tokens[0])) {
              return prefixHelper(tokens.slice(1), sTokens.slice(1), res.concat(sTokens[0]));
            } else {
              if (self._options.prefixMatch) {
                // No prefix matches found, return the entire suggestion
              } else {
                // search for non-prefix completions
                return noPrefixHelper(tokensToConsider, suggestionTokens);
              }
            }
          } else {
            return res.concat(sTokens);
          }
        }
      }
    }
  }, {
    key: '_tokenize',
    value: function _tokenize(text) {
      var trim = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      return text.split(' ').map(function (w) {
        return trim ? w.trim() : w;
      }).filter(function (t) {
        return t !== '';
      });
    }
  }, {
    key: '_ngrams',
    value: function _ngrams(tokens, n) {
      var wlen = tokens.length;
      n = Math.min(tokens.length, n);
      var words = tokens.slice(wlen - n);
      var ngrams = [];
      for (var i = 0; i < n; i++) {
        ngrams.push(words);
        words = words.slice(1);
      }
      return ngrams;
    }
  }, {
    key: '_sort',
    value: function _sort(ngrams) {

      return function (a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();

        var score = {
          a: 0,
          b: 0
        };
        for (var i = 0; i < ngrams.length; i++) {
          var ngram = ngrams[i];
          var ai = a.indexOf(ngram);
          var bi = b.indexOf(ngram);
          var multiplier = ngrams.length - i;
          if (ai === -1 && ai === bi) {
            continue;
          } else if (a === ngram) {
            score.a = (score.a + 10) * multiplier;
          } else if (b === ngram) {
            score.b = (score.b + 10) * multiplier;
          } else if (a.startsWith(ngram) && b.startsWith(ngram)) {
            if (a.length < b.length) {
              score.a = (score.a + 5) * multiplier;
            } else {
              score.b = score.b + 5 * multiplier;
            }
          } else if (a.startsWith(ngram)) {
            score.a = (score.a + 5) * multiplier;
          } else if (b.startsWith(ngram)) {
            score.b = (score.b + 5) * multiplier;
          } else if (a.indexOf(ngram)) {
            score.a = (score.a + 1) * multiplier;
          } else if (b.indexOf(ngram)) {
            score.b = (score.b + 1) * multiplier;
          } else if (ai > bi) {
            score.b = (score.b + 1) * multiplier;
          } else if (ai < bi) {
            score.a = (score.a + 1) * multiplier;
          }
          if (score.a > score.b) {
            return -1;
          } else if (score.a < score.b) {
            return 1;
          } else {
            return a.localeCompare(b);
          }
        }
      };
    }
  }, {
    key: '_escape',
    value: function _escape(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
  }]);

  return DictionaryTypeAhead;
}();

exports.default = DictionaryTypeAhead;
},{}],2:[function(require,module,exports){
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


},{"../dist":1}]},{},[2]);
