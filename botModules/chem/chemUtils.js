var molWeights = require('./molecularWeights.js');

/* 
 * Chemical equation balancer
 * 
 * Copyright (c) 2015 Project Nayuki
 * All rights reserved. Contact Nayuki for licensing.
 * http://www.nayuki.io/page/chemical-equation-balancer-javascript
 *
 * Edited by Omar Shaikh, to run on node.js
 */

"use strict";


/*---- Main functions, which are the entry points from the HTML code ----*/

// Balances the given formula string and sets the HTML output on the page. Returns nothing.
function balance(formulaStr) {  
  // Parse equation
  var eqn;
  try {
    eqn = parse(formulaStr);
  } catch (e) {
    var balanced;
    if (typeof e == "string") {  // Simple error message string
      balanced = ("Syntax error: " + e);
      
    } else if ("start" in e) {  // Error message object with start and possibly end character indices
      balanced = ("Syntax error: " + e.message);
    }

    return balanced || "Error";
  }
  
  try {
    var matrix = buildMatrix(eqn);                // Set up matrix
    solve(matrix);                                // Solve linear system
    var coefs = extractCoefficients(matrix);      // Get coefficients
    checkAnswer(eqn, coefs);                      // Self-test, should not fail
    return coefs // Display balanced equation
  } catch (e) {
    return e.toString();
  }
}


/* Core number-processing fuctions */

// Returns a matrix based on the given equation object.
function buildMatrix(eqn) {
  var elems = eqn.getElements();
  var rows = elems.length + 1;
  var cols = eqn.getLeftSide().length + eqn.getRightSide().length + 1;
  var matrix = new Matrix(rows, cols);
  for (var i = 0; i < elems.length; i++) {
    var j = 0;
    for (var k = 0, lhs = eqn.getLeftSide() ; k < lhs.length; j++, k++)
      matrix.set(i, j,  lhs[k].countElement(elems[i]));
    for (var k = 0, rhs = eqn.getRightSide(); k < rhs.length; j++, k++)
      matrix.set(i, j, -rhs[k].countElement(elems[i]));
  }
  return matrix;
}


function solve(matrix) {
  matrix.gaussJordanEliminate();
  
  // Find row with more than one non-zero coefficient
  var i;
  for (i = 0; i < matrix.rowCount() - 1; i++) {
    if (countNonzeroCoeffs(matrix, i) > 1)
      break;
  }
  if (i == matrix.rowCount() - 1)
    throw "All-zero solution";  // Unique solution with all coefficients zero
  
  // Add an inhomogeneous equation
  matrix.set(matrix.rowCount() - 1, i, 1);
  matrix.set(matrix.rowCount() - 1, matrix.columnCount() - 1, 1);
  
  matrix.gaussJordanEliminate();
}


function countNonzeroCoeffs(matrix, row) {
  var count = 0;
  for (var i = 0; i < matrix.columnCount(); i++) {
    if (matrix.get(row, i) != 0)
      count++;
  }
  return count;
}


function extractCoefficients(matrix) {
  var rows = matrix.rowCount();
  var cols = matrix.columnCount();
  
  if (cols - 1 > rows || matrix.get(cols - 2, cols - 2) == 0)
    throw "Multiple independent solutions";
  
  var lcm = 1;
  for (var i = 0; i < cols - 1; i++)
    lcm = checkedMultiply(lcm / gcd(lcm, matrix.get(i, i)), matrix.get(i, i));
  
  var coefs = [];
  var allzero = true;
  for (var i = 0; i < cols - 1; i++) {
    var coef = checkedMultiply(lcm / matrix.get(i, i), matrix.get(i, cols - 1));
    coefs.push(coef);
    allzero &= coef == 0;
  }
  if (allzero)
    throw "Assertion error: All-zero solution";
  return coefs;
}


// Throws an exception if there's a problem, otherwise returns silently.
function checkAnswer(eqn, coefs) {
  if (coefs.length != eqn.getLeftSide().length + eqn.getRightSide().length)
    throw "Assertion error: Mismatched length";
  
  var allzero = true;
  coefs.forEach(function(coef) {
    if (typeof coef != "number" || isNaN(coef) || Math.floor(coef) != coef)
      throw "Assertion error: Not an integer";
    allzero &= coef == 0;
  });
  if (allzero)
    throw "Assertion error: All-zero solution";
  
  var elems = eqn.getElements();
  for (var i = 0; i < elems.length; i++) {
    var sum = 0;
    var j = 0;
    for (var k = 0, lhs = eqn.getLeftSide() ; k < lhs.length; j++, k++)
      sum = checkedAdd(sum, checkedMultiply(lhs[k].countElement(elems[i]),  coefs[j]));
    for (var k = 0, rhs = eqn.getRightSide(); k < rhs.length; j++, k++)
      sum = checkedAdd(sum, checkedMultiply(rhs[k].countElement(elems[i]), -coefs[j]));
    if (sum != 0)
      throw "Assertion error: Incorrect balance";
  }
}


/*---- Chemical equation data types ----*/

// A complete chemical equation. It has a left-hand side list of terms and a right-hand side list of terms.
// For example: H2 + O2 -> H2O.
function Equation(lhs, rhs) {
  // Make defensive copies
  lhs = lhs.clone();
  rhs = rhs.clone();
  
  this.getLeftSide  = function() { return lhs.clone(); };
  this.getRightSide = function() { return rhs.clone(); };
  
  // Returns an array of the names all of the elements used in this equation.
  // The array represents a set, so the items are in an arbitrary order and no item is repeated.
  this.getElements = function() {
    var result = new Set();
    lhs.forEach(function(item) {
      item.getElements(result);
    });
    rhs.forEach(function(item) {
      item.getElements(result);
    });
    return result.toArray();
  };
  
  // Returns an HTML element representing this equation.
  // 'coefs' is an optional argument, which is an array of coefficients to match with the terms.
  
}


// A term in a chemical equation. It has a list of groups or elements, and a charge.
// For example: H3O^+, or e^-.
function Term(items, charge) {
  if (items.length == 0 && charge != -1)
    throw "Invalid term";  // Electron case
  
  items = items.clone();
  
  this.getItems = function() { return items.clone(); };
  
  this.getElements = function(resultSet) {
    resultSet.add("e");
    items.forEach(function(item) {
      item.getElements(resultSet);
    });
  };
  
  // Counts the number of times the given element (specified as a string) occurs in this term, taking groups and counts into account, returning an integer.
  this.countElement = function(name) {
    if (name == "e") {
      return -charge;
    } else {
      var sum = 0;
      items.forEach(function(item) {
        sum = checkedAdd(sum, item.countElement(name));
      });
      return sum;
    }
  };
  
}


// A group in a term. It has a list of groups or elements.
// For example: (OH)3
function Group(items, count) {
  if (count < 1)
    throw "Assertion error: Count must be a positive integer";
  items = items.clone();
  
  this.getItems = function() { return items.clone(); };
  
  this.getCount = function() { return count; };
  
  this.getElements = function(resultSet) {
    items.forEach(function(item) {
      item.getElements(resultSet);
    });
  };
  
  this.countElement = function(name) {
    var sum = 0;
    items.forEach(function(item) {
      sum = checkedAdd(sum, checkedMultiply(item.countElement(name), count));
    });
    return sum;
  };
  

}


// A chemical element.
// For example: Na, F2, Ace, Uuq6
function Element(name, count) {
  if (count < 1)
    throw "Assertion error: Count must be a positive integer";
  
  this.getName = function() { return name; };
  
  this.getCount = function() { return count; };
  
  this.getElements = function(resultSet) { resultSet.add(name); };
  
  this.countElement = function(n) { return n == name ? count : 0; };
  
}


/*---- Parser functions ----*/

// Parses the given formula string and returns an equation object, or throws an exception.
function parse(formulaStr) {
  var tokenizer = new Tokenizer(formulaStr);
  return parseEquation(tokenizer);
}


// Parses and returns an equation.
function parseEquation(tok) {
  var lhs = [];
  var rhs = [];
  
  lhs.push(parseTerm(tok));
  while (true) {
    var next = tok.peek();
    if (next == "=") {
      tok.consume("=");
      break;
    } else if (next == null) {
      throw {message: "Plus or equal sign expected", start: tok.position()};
    } else if (next == "+") {
      tok.consume("+");
      lhs.push(parseTerm(tok));
    } else
      throw {message: "Plus expected", start: tok.position()};
  }
  
  rhs.push(parseTerm(tok));
  while (true) {
    var next = tok.peek();
    if (next == null)
      break;
    else if (next == "+") {
      tok.consume("+");
      rhs.push(parseTerm(tok));
    } else
      throw {message: "Plus or end expected", start: tok.position()};
  }
  
  return new Equation(lhs, rhs);
}


// Parses and returns a term.
function parseTerm(tok) {
  var startPosition = tok.position();
  
  // Parse groups and elements
  var items = [];
  while (true) {
    var next = tok.peek();
    if (next == null)
      break;
    else if (next == "(")
      items.push(parseGroup(tok));
    else if (/^[A-Za-z][a-z]*$/.test(next))
      items.push(parseElement(tok));
    else
      break;
  }
  
  // Parse optional charge
  var charge = 0;
  var next = tok.peek();
  if (next != null && next == "^") {
    tok.consume("^");
    next = tok.peek();
    if (next == null)
      throw {message: "Number or sign expected", start: tok.position()};
    else
      charge = parseOptionalNumber(tok);
    
    next = tok.peek();
    if (next == "+")
      charge = +charge;  // No-op
    else if (next == "-")
      charge = -charge;
    else
      throw {message: "Sign expected", start: tok.position()};
    tok.take();  // Consume the sign
  }
  
  // Check if term is valid
  var elems = new Set();
  for (var i = 0; i < items.length; i++)
    items[i].getElements(elems);
  elems = elems.toArray();  // List of all elements used in this term, with no repeats
  if (items.length == 0) {
    throw {message: "Invalid term - empty", start: startPosition, end: tok.position()};
  } else if (elems.indexOf("e") != -1) {  // If it's the special electron element
    if (items.length > 1)
      throw {message: "Invalid term - electron needs to stand alone", start: startPosition, end: tok.position()};
    else if (charge != 0 && charge != -1)
      throw {message: "Invalid term - invalid charge for electron", start: startPosition, end: tok.position()};
    // Tweak data
    items = [];
    charge = -1;
  } else {  // Otherwise, a term must not contain an element that starts with lowercase
    for (var i = 0; i < elems.length; i++) {
      if (/^[a-z]+$/.test(elems[i]))
        throw {message: 'Invalid element name "' + elems[i] + '"', start: startPosition, end: tok.position()};
    }
  }
  
  return new Term(items, charge);
}


// Parses and returns a group.
function parseGroup(tok) {
  var startPosition = tok.position();
  tok.consume("(");
  var items = [];
  while (true) {
    var next = tok.peek();
    if (next == null)
      throw {message: "Element, group, or closing parenthesis expected", start: tok.position()};
    else if (next == "(")
      items.push(parseGroup(tok));
    else if (/^[A-Za-z][a-z]*$/.test(next))
      items.push(parseElement(tok));
    else if (next == ")") {
      tok.consume(")");
      if (items.length == 0)
        throw {message: "Empty group", start: startPosition, end: tok.position()};
      break;
    } else
      throw {message: "Element, group, or closing parenthesis expected", start: tok.position()};
  }
  
  return new Group(items, parseOptionalNumber(tok));
}


// Parses and returns an element.
function parseElement(tok) {
  var name = tok.take();
  if (!/^[A-Za-z][a-z]*$/.test(name))
    throw "Assertion error";
  return new Element(name, parseOptionalNumber(tok));
}


// Parses a number if it's the next token, returning a non-negative integer, with a default of 1.
function parseOptionalNumber(tok) {
  var next = tok.peek();
  if (next != null && /^[0-9]+$/.test(next))
    return checkedParseInt(tok.take());
  else
    return 1;
}


/*---- Tokenizer object ----*/

// Tokenizes a formula into a stream of token strings.
function Tokenizer(str) {
  var i = 0;
  
  // Returns the index of the next character to tokenize.
  this.position = function() {
    return i;
  };
  
  // Returns the next token as a string, or null if the end of the token stream is reached.
  this.peek = function() {
    if (i == str.length)  // End of stream
      return null;
    
    var match = /^([A-Za-z][a-z]*|[0-9]+|[+\-^=()])/.exec(str.substring(i));
    if (match == null)
      throw {message: "Invalid symbol", start: i};
    return match[0];
  };
  
  // Returns the next token as a string and advances this tokenizer past the token.
  this.take = function() {
    var result = this.peek();
    if (result == null)
      throw "Advancing beyond last token";
    i += result.length;
    skipSpaces();
    return result;
  };
  
  // Takes the next token and checks that it matches the given string, or throws an exception.
  this.consume = function(s) {
    if (this.take() != s)
      throw "Token mismatch";
  };
  
  function skipSpaces() {
    var match = /^[ \t]*/.exec(str.substring(i));
    i += match[0].length;
  }
  
  str = str.replace(/\u2212/g, "-");
  skipSpaces();
}


/*---- Matrix object ----*/

// A matrix of integers.
function Matrix(rows, cols) {
  if (rows < 0 || cols < 0)
    throw "Illegal argument";
  
  // Initialize with zeros
  var row = [];
  for (var j = 0; j < cols; j++)
    row.push(0);
  var cells = [];  // Main data (the matrix)
  for (var i = 0; i < rows; i++)
    cells.push(row.clone());
  row = null;
  
  /* Accessor functions */
  
  this.rowCount    = function() { return rows; };
  this.columnCount = function() { return cols; };
  
  // Returns the value of the given cell in the matrix, where r is the row and c is the column.
  this.get = function(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols)
      throw "Index out of bounds";
    return cells[r][c];
  };
  
  // Sets the given cell in the matrix to the given value, where r is the row and c is the column.
  this.set = function(r, c, val) {
    if (r < 0 || r >= rows || c < 0 || c >= cols)
      throw "Index out of bounds";
    cells[r][c] = val;
  };
  
  /* Private helper functions for gaussJordanEliminate() */
  
  // Swaps the two rows of the given indices in this matrix. The degenerate case of i == j is allowed.
  function swapRows(i, j) {
    if (i < 0 || i >= rows || j < 0 || j >= rows)
      throw "Index out of bounds";
    var temp = cells[i];
    cells[i] = cells[j];
    cells[j] = temp;
  }
  
  // Returns a new row that is the sum of the two given rows. The rows are not indices. This object's data is unused.
  // For example, addRow([3, 1, 4], [1, 5, 6]) = [4, 6, 10].
  function addRows(x, y) {
    var z = x.clone();
    for (var i = 0; i < z.length; i++)
      z[i] = checkedAdd(x[i], y[i]);
    return z;
  }
  
  // Returns a new row that is the product of the given row with the given scalar. The row is is not an index. This object's data is unused.
  // For example, multiplyRow([0, 1, 3], 4) = [0, 4, 12].
  function multiplyRow(x, c) {
    var y = x.clone();
    for (var i = 0; i < y.length; i++)
      y[i] = checkedMultiply(x[i], c);
    return y;
  }
  
  // Returns the GCD of all the numbers in the given row. The row is is not an index. This object's data is unused.
  // For example, gcdRow([3, 6, 9, 12]) = 3.
  function gcdRow(x) {
    var result = 0;
    x.forEach(function(val) {
      result = gcd(val, result);
    });
    return result;
  }
  
  // Returns a new row where the leading non-zero number (if any) is positive, and the GCD of the row is 0 or 1. This object's data is unused.
  // For example, simplifyRow([0, -2, 2, 4]) = [0, 1, -1, -2].
  function simplifyRow(x) {
    var sign = 0;
    for (var i = 0; i < x.length; i++) {
      if (x[i] > 0) {
        sign = 1;
        break;
      } else if (x[i] < 0) {
        sign = -1;
        break;
      }
    }
    var y = x.clone();
    if (sign == 0)
      return y;
    var g = gcdRow(x) * sign;
    for (var i = 0; i < y.length; i++)
      y[i] /= g;
    return y;
  }
  
  // Changes this matrix to reduced row echelon form (RREF), except that each leading coefficient is not necessarily 1. Each row is simplified.
  this.gaussJordanEliminate = function() {
    // Simplify all rows
    for (var i = 0; i < rows; i++)
      cells[i] = simplifyRow(cells[i]);
    
    // Compute row echelon form (REF)
    var numPivots = 0;
    for (var i = 0; i < cols; i++) {
      // Find pivot
      var pivotRow = numPivots;
      while (pivotRow < rows && cells[pivotRow][i] == 0)
        pivotRow++;
      if (pivotRow == rows)
        continue;
      var pivot = cells[pivotRow][i];
      swapRows(numPivots, pivotRow);
      numPivots++;
      
      // Eliminate below
      for (var j = numPivots; j < rows; j++) {
        var g = gcd(pivot, cells[j][i]);
        cells[j] = simplifyRow(addRows(multiplyRow(cells[j], pivot / g), multiplyRow(cells[i], -cells[j][i] / g)));
      }
    }
    
    // Compute reduced row echelon form (RREF), but the leading coefficient need not be 1
    for (var i = rows - 1; i >= 0; i--) {
      // Find pivot
      var pivotCol = 0;
      while (pivotCol < cols && cells[i][pivotCol] == 0)
        pivotCol++;
      if (pivotCol == cols)
        continue;
      var pivot = cells[i][pivotCol];
      
      // Eliminate above
      for (var j = i - 1; j >= 0; j--) {
        var g = gcd(pivot, cells[j][pivotCol]);
        cells[j] = simplifyRow(addRows(multiplyRow(cells[j], pivot / g), multiplyRow(cells[i], -cells[j][pivotCol] / g)));
      }
    }
  };
  
  // Returns a string representation of this matrix, for debugging purposes.
  this.toString = function() {
    var result = "[";
    for (var i = 0; i < rows; i++) {
      if (i != 0) result += "],\n";
      result += "[";
      for (var j = 0; j < cols; j++) {
        if (j != 0) result += ", ";
        result += cells[i][j];
      }
      result += "]";
    }
    return result + "]";
  };
}


/*---- Set object ----*/

function Set() {
  // Storage for the set
  var items = [];
  
  // Adds the given object to the set. Returns nothing.
  this.add = function(obj) {
    if (items.indexOf(obj) == -1)
      items.push(obj);
  };
  
  // Tests if the given object is in the set, returning a Boolean.
  this.contains = function(obj) {
    return items.indexOf(obj) != -1;
  };
  
  // Returns an array containing the elements of this set in an arbitrary order, with no duplicates.
  this.toArray = function() {
    return items.clone();
  };
}


/*---- Math functions (especially checked integer operations) ----*/

var INT_MAX = 9007199254740992;  // 2^53

// Returns the given string parsed into a number, or throws an exception if the result is too large.
function checkedParseInt(str) {
  var result = parseInt(str, 10);
  if (isNaN(result))
    throw "Not a number";
  if (result <= -INT_MAX || result >= INT_MAX)
    throw "Arithmetic overflow";
  return result;
}

// Returns the sum of the given integers, or throws an exception if the result is too large.
function checkedAdd(x, y) {
  var z = x + y;
  if (z <= -INT_MAX || z >= INT_MAX)
    throw "Arithmetic overflow";
  return z;
}

// Returns the product of the given integers, or throws an exception if the result is too large.
function checkedMultiply(x, y) {
  var z = x * y;
  if (z <= -INT_MAX || z >= INT_MAX)
    throw "Arithmetic overflow";
  return z;
}


// Returns the greatest common divisor of the given integers.
function gcd(x, y) {
  if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
    throw "Invalid argument";
  x = Math.abs(x);
  y = Math.abs(y);
  while (y != 0) {
    var z = x % y;
    x = y;
    y = z;
  }
  return x;
}


/*---- Miscellaneous ----*/

// Unicode character constants (because this script file's character encoding is unspecified)
var MINUS = "\u2212";        // Minus sign
var RIGHT_ARROW = "\u2192";  // Right arrow


// Monkey patching. Returns a shallow copy of this array. Usually used for making defensive copies.
Array.prototype.clone = Array.prototype.slice;

///////////////////////////////////////////////////////////////////////////////////////////////////
// End of formula balancer.
///////////////////////////////////////////////////////////////////////////////////////////////////


var electronConfig = function (atomicNumber) {

  var limit = atomicNumber;

  var buildOrbitalCache = function() {
    var elecObject = {s: 2, p: 6, d: 10, f: 14};
    for (var i = 'f'.charCodeAt(0) + 1; i <= 'f'.charCodeAt(0) + 20; i++) {
      elecObject[String.fromCharCode(i)] = elecObject[String.fromCharCode(i - 1)] + 4; 
    }

    elecObject.s = 2;
    elecObject.p = 6;

    return elecObject;
  }

  var electronOrbitals = buildOrbitalCache(electronOrbitals);

  var triangleBuild = function () {
    var tri = []
    var elec = ['s',  'p', 'd', 'f'];
    for (var i = 1; i <= limit; i++) {
      tri.push([]);
      for (var j = 1; j <= i; j++) {

        var orbital;

        if (elec[j - 1]) {
          orbital = elec[j - 1];
        } else {
          orbital = String.fromCharCode('f'.charCodeAt(0) + (j - 4));
        }

        tri[i-1][j-1] = i +  "" + orbital;
      }
    }
    return tri;
  }

  var triangle = triangleBuild();

  var diagonalTraverse = function(arr, fn) {

    for (var i = 0; i < arr.length * 2; i++) {

      var k = i;
      for (var j = 0; j < arr.length * 2; j++) {
        if (arr[j] && arr[j][k]) {
          fn(arr[j][k]);
        }
        k--;
      }

    }

  }

  var total = 0;
  var config = [];

  diagonalTraverse(triangle, function(element){
    if (total < atomicNumber) {
      total += electronOrbitals[element.charAt(element.length - 1)];
      config.push(element);
    }
  });

  var generateShorthand = function (config, total) {

    var sorted = config.slice();
    var finalElec = sorted.pop();
    var numElec = total - atomicNumber;
    var shorthand = "";

    sorted.sort();

    var counts = {};

    for (var i = 0; i < sorted.length; i++) {
      if (counts[parseInt(sorted[i].charAt(0))]) {
        counts[parseInt(sorted[i].charAt(0))]++;
      } else {
        counts[parseInt(sorted[i].charAt(0))] = 1;
      }
    }

    var startChar = 'K'.charCodeAt(0);
    for (var key in counts) {
      if (key == counts[key]) {
        shorthand += String.fromCharCode(startChar);
        startChar++;
      }
    }

    sorted = sorted.slice(sorted.indexOf(shorthand.length + "s") + 1);

    if (numElec) {
      finalElec = finalElec + "^" + (electronOrbitals[finalElec.charAt(finalElec.length - 1)] - numElec);
    } 

    sorted.push(finalElec);
    sorted.sort();
    shorthand += " " + sorted.join(" ");
    return shorthand;
  }

  var shorthand = generateShorthand(config, total);


  return shorthand;
}

var molMass = function(equation) {
  try {

    var elements = equation.split(/(?=[A-Z])/);
    var total = 0;

    for (var i = 0; i < elements.length; i++) {
      var obj = {};
      var elementSymbol = elements[i].split(/\d+/);
      var elementCount = elements[i].match(/\d+/);
      if (!elementCount) {
        obj.elementCount = 1;
      } else {
        obj.elementCount = elementCount[0];
      }

      if (!elementSymbol) {
        throw new Error("SHIT HIT THE FAN");
      } else {
        obj.elementSymbol = elementSymbol[0];
      }

      console.log(obj);

      total += molWeights[obj.elementSymbol] * parseInt(obj.elementCount);
    }

    return equation + ": " + total + "g";
  } catch (e) {
    console.log(e);
    return "Something went wrong. Talk to the person who made me.";
  }
}

module.exports = {
  balance: balance,
  electronConfig: electronConfig,
  molMass: molMass
}

