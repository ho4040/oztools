function McState() {

 var that = this ;

 var rules = [] ;
 
 var state = function (regex) {
  return function (action) {
   rules.push(new McRule(regex,action)) ;
  } ;
 } ;

 state.rules = rules ;

 state.lex = function (input) {
   var nextCont = state.run(input) ;
   while (typeof nextCont == "function") {
     nextCont = nextCont() ;
   }
   return nextCont ;
 }

 state.run = McRunMethod ;

 state.continuation = function (input) {
   return function () {
     return state.run(input) ;
   } ;
 }

 return state ;
}


function McRule(regex,action) {
  // Each rule is re-written to match prefixes of the input string.
  this.regex = new RegExp("^(" + regex.source + ")") ;
  if (this.regex.compile) this.regex.compile(this.regex) ;
  this.action = action ;
}

McRule.prototype.matches = function (s) {
 var m = s.match(this.regex) ;
 if (m) m.shift() ;
 return m ;
} ;


function McRunMethod(input) {
  var longestMatchedRule = null ;
  var longestMatch = null ;
  var longestMatchedLength = -1 ;
  
  for (var i = this.rules.length-1; i >= 0; --i) {
    var r = this.rules[i] ;

    var m = r.matches (input) ;
    
    if (m && (m[0].length >= longestMatchedLength)) {
      longestMatchedRule = r ;
      longestMatch = m ;
      longestMatchedLength = m[0].length ;
    }
  }
  
  if (longestMatchedRule) {
    return longestMatchedRule.action(longestMatch,input.substring(longestMatchedLength),this) ;
  } else {
    throw ("Lexing error; no match found for: '" + input + "'") ;
  }
}

/* Creates a continuation that switches analysis to another lexical state.  */
function McCONTINUE(state) {
  return function (rest) {
    return state.run(rest) ;
  }
}

// For "package-style" access:
var McLexer = {
 State : McState 
} ;







