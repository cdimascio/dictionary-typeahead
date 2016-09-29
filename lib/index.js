export default class DictionaryTypeAhead {
  constructor(options = {limit: -1, sorter: null, prefixMatch: false}) {
    this._options = options;
  }
  suggest(dictionary, text, pos) {
    return new Promise((resolve, reject) => {
      if (!dictionary || !text || text[text.length - 1] === ' ') {
        resolve([]);
      }
      const tokens = this._tokenize(text.toLowerCase().substring(0, pos));
      let ngrams = this._ngrams(tokens, 3)
        .reduce((acc, tokens) => {
          const string = tokens.join(' ').trim();
          if (string) {
            acc.push(string);
          }
          return acc;
        }, [])

      if (ngrams.length === 0) {
          resolve([]);
      }
      const pattern = `(${ngrams.map(n => this._escape(n)).join('|')})`;
      const matches = dictionary.filter(i => {
        const p = this._options.prefixMatch ? '^' : '\\b';
        const re = new RegExp(`${p}${pattern}.*`);
        const match = re.exec(i.toLowerCase());
        return match !== null && match !== '';
      });

      const sorter = this._options.sorter ? this._options.sorter : this._sort(ngrams);
      if (this._options.limit && this._options.limit > -1) {
        return resolve(matches.slice(0, this._options.limit).sort(sorter));
      } else {
        return resolve(matches.sort(sorter));
      }
    });
  }

 complete(suggestion, text, pos) {
    const self = this;
    const tokenBeforeCursor = this._tokenize(text.substring(0, pos), false);
    const tokensAfterCursor = this._tokenize(text.substring(pos, text.length), false);
    const suggestionTokens = this._tokenize(suggestion);

    const suggestionStartIdx = (tokenBeforeCursor.length - suggestionTokens.length) > -1
      ? tokenBeforeCursor.length - suggestionTokens.length : 0;
    const tokensToConsider = tokenBeforeCursor.slice(suggestionStartIdx, tokenBeforeCursor.length);

    const textSuggestion = buildSuggestionTokens(tokensToConsider, suggestionTokens).join(' ');
    const textBeforeSuggestion = tokenBeforeCursor.slice(0,suggestionStartIdx).join(' ');
    const textAfterSuggestion = tokensAfterCursor.join(' ');

    return {
      text: `${textBeforeSuggestion} ${textSuggestion}${textAfterSuggestion}`.trim(),
      pos: `${textBeforeSuggestion} ${textSuggestion}`.trim().length
    };

    function buildSuggestionTokens(tokensToConsider, suggestionTokens) {
      return prefixHelper(tokensToConsider, suggestionTokens);

      function is(a) {
        return { equalTo: b => a.toLowerCase().trim() === b.toLowerCase().trim() };
      }
      function does(a) {
        return { startWith: b => a.toLowerCase().trim().startsWith(b.toLowerCase().trim()) };
      }

      function noPrefixHelper(tokens, sTokens, res = []) {
        if (tokens.length > 1) {
          if (sTokens.map(s => s.toLowerCase()).indexOf(tokens[0]) === -1) {
            return noPrefixHelper(tokens.slice(1), sTokens, res.concat(tokens[0]))
          } else {
            return res.concat(sTokens);
          }
        } else {
          return res.concat(sTokens);
        }
      }

      function prefixHelper(tokens, sTokens, res = []) {
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

 _tokenize(text, trim = true) {
    return text.split(' ').map(w => trim ? w.trim() : w).filter(t => t !== '');
  }

 _ngrams(tokens, n) {
    const wlen = tokens.length
    n = Math.min(tokens.length, n);
    let words = tokens.slice(wlen - n);
    const ngrams = [];
    for (let i=0; i < n; i++) {
      ngrams.push(words)
      words = words.slice(1);
    }
    return ngrams
  }

 _sort(ngrams) {

    return (a, b) => {
      a = a.toLowerCase();
      b = b.toLowerCase();

      const score = {
        a: 0,
        b: 0
      };
      for (let i = 0; i < ngrams.length; i++) {
        const ngram = ngrams[i];
        const ai = a.indexOf(ngram);
        const bi = b.indexOf(ngram);
        const multiplier = ngrams.length - i;
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
            score.b = score.b + 5  * multiplier;
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
    }
  }

 _escape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
}
