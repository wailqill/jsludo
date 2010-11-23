(function(win, undefined) {
  var FACTOR = 31;
  var PieceState =  {
    TRUE: 1,
    FALSE: 2,
    GOAL: 3
  }
  var board = document.getElementById("board");
  var tiles, pieces;
  var movesLeft = 0;

  function l() {
    console.log.apply(console, arguments);
  }
  
  function diceHandler() {
    movesLeft = 4;
    l(movesLeft);
  };
  
  function pieceSelectHandler(e) {
    if (movesLeft === 0) return;
    var elm = e.target;
    if (elm.getAttribute("role") === "piece") {
      var x = elm.getAttribute("data-x");
      var y = elm.getAttribute("data-y");
      movePieceFromTile(elm, x, y);
    }
  };
  
  function movePieceFromTile(piece, x, y) {
    var tile = getItem('tile', x, y);
    var nx, ny;
    var rules = tile ? (tile.getAttribute("data-ruleset") || "").split('') : [];
    if (!tile || rules.length === 0) {
      // Piece at home base.
      var color = piece.getAttribute('data-color');
      var start = document.querySelector("#board div[role='tile'][data-start='" + color + "']");
      nx = start.getAttribute('data-x');
      ny = start.getAttribute('data-y');
    } else {
      for (var r, i=0; r=rules[i]; i++) {
        switch (r) {
          case ">": nx=+x+1; ny=+y;   break;
          case "^": nx=+x;   ny=+y-1; break;
          case "<": nx=+x-1; ny=+y;   break;
          case "v": nx=+x;   ny=+y+1; break;
        }
        var state = isTileValidForPiece(piece, nx, ny);
        if (state === PieceState.FALSE) {
          break;
        } else if (state === PieceState.GOAL) {
          piece.parentNode.removeChild(piece);
          alert("IN!")
        }
      }
    }
    if (nx !== undefined && ny !== undefined) {
      movesLeft--;
      piece.style.left = (FACTOR * nx) + "px";
      piece.style.top = (FACTOR * ny) + "px";
      piece.setAttribute("data-x", nx);
      piece.setAttribute("data-y", ny);
      if (movesLeft !== 0) {
        setTimeout(function() {
          movePieceFromTile(piece, nx, ny);
        }, 500);
      }
    }
  };
  
  function isTileValidForPiece(piece, x, y) {
    var color = piece.getAttribute('data-color');
    var tile = getItem('tile', x, y);
    if (document.querySelector("#board div[role='goal'][data-x='" + x + "'][data-y='" + y + "']"))
      return PieceState.GOAL;
    if (!!document.querySelector("#board div[role='tile'][data-restriction=''][data-x='" + x + "'][data-y='" + y + "']")
        ||
        !!document.querySelector("#board div[role='tile'][data-restriction='" + color +"'][data-x='" + x + "'][data-y='" + y + "']"))
      return PieceState.TRUE;
    return PieceState.FALSE;
  };
  
  function getItem(role, x, y) {
    return document.querySelector("#board div[role='" + role + "'][data-x='" + x + "'][data-y='" + y + "']");
  };
  
  function positionTiles() {
    tiles = document.querySelectorAll("#board div[role='tile'], #board div[role='goal']");
    for (var i=0, tile; tile = tiles[i]; i++) {
      var x = tile.getAttribute("data-x");
      var y = tile.getAttribute("data-y");
      tile.style.left = (x * FACTOR) + "px";
      tile.style.top = (y * FACTOR) + "px";
    }
  };
  
  function positionPieces() {
    pieces = document.querySelectorAll("#board div[role='piece']");
    for (var i=0, piece; piece = pieces[i]; i++) {
      var x = piece.getAttribute("data-x");
      var y = piece.getAttribute("data-y");
      piece.style.left = (x * FACTOR) + "px";
      piece.style.top = (y * FACTOR) + "px";
    }
  }
  
  function init() {
    board.addEventListener('click', pieceSelectHandler, true);
    document.getElementById('dice').addEventListener('click', diceHandler, true);
    
    positionTiles();
    positionPieces();
  };
  
  init();
})(this)