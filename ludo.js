(function(win, undefined) {
  var MOVE_DELAY = 20
    , FACTOR = 31
    , isTouch = 'ontouchstart' in window
    , PieceMovability =  {
        TRUE: 1,
        FALSE: 2,
        GOAL: 3
      }
    , tiles, pieces
    , playerCount, currentPlayer
    , allColors = 'gybr'.split('')
    , movesLeft = 0
    , board = document.getElementById("board")
    , dice = document.getElementById("dice")
    ;

  function l() {
    console.log.apply(console, arguments);
  }
  
  function diceHandler() {
    if (movesLeft > 0) return;
    movesLeft = Math.ceil(Math.random() * 6);
    dice.innerText = movesLeft;
    dice.setAttribute('data-rolled', movesLeft);
  };
  
  function pieceSelectHandler(e) {
    if (movesLeft === 0) return;
    
    var elm = e.target;
    if (elm.getAttribute('role') !== 'piece') return;
    if (allColors[currentPlayer] !== elm.getAttribute('data-color')) {
      alert('Cheater!');
      return;
    }
    
    if (elm.getAttribute("role") === "piece") {
      var x = elm.getAttribute("data-x");
      var y = elm.getAttribute("data-y");
      elm.setAttribute("data-start-x", x);
      elm.setAttribute("data-start-y", y);
      movePieceFromTile(elm, x, y);
    }
  };
  
  function movePieceFromTile(piece, x, y) {
    var tile = getItem('tile', x, y);
    var nx, ny, state;
    var rules = tile ? (tile.getAttribute("data-direction") || "").split('') : [];
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
        state = isTileValidForPiece(piece, nx, ny);
        if (state === PieceMovability.FALSE) {
          continue;
        } else if (state === PieceMovability.TRUE) {
          break;
        } else if (state === PieceMovability.GOAL) {
          piece.parentNode.removeChild(piece);
          alert("IN!")
          break;
        }
      }
    }
    if (nx !== undefined && ny !== undefined) {
      movesLeft--;
      piece.style.left = (FACTOR * nx) + "px";
      piece.style.top = (FACTOR * ny) + "px";
      piece.setAttribute("data-x", nx);
      piece.setAttribute("data-y", ny);
      dice.innerText = movesLeft;
      if (movesLeft !== 0) {
        setTimeout(function() {
          movePieceFromTile(piece, nx, ny);
        }, MOVE_DELAY);
      } else {
        if (state === PieceMovability.FALSE) {
          alert("Invalid move!");
          revertMove(piece);
        } else {
          dice.innerText = "Roll";
          nextPlayer();
        }
        piece.removeAttribute("data-start-x");        
        piece.removeAttribute("data-start-y");
      }
    }
  };
  
  function nextPlayer() {
    currentPlayer++;
    if (currentPlayer >= playerCount)
      currentPlayer = 0;
  };
  
  function revertMove(piece) {
    var x = piece.getAttribute("data-start-x");
    var y = piece.getAttribute("data-start-y");
    piece.setAttribute('data-x', x);
    piece.setAttribute('data-y', y);
    movesLeft = dice.innerText = parseInt(dice.getAttribute('data-rolled'));
    positionPieces();
  };
  
  function isTileValidForPiece(piece, x, y) {
    var color = piece.getAttribute('data-color');
    var tile = getItem('tile', x, y);

    // Check if piece already at tile
    if (document.querySelectorAll("#board div[role='piece'][data-x='" + x + "'][data-y='" + y + "']").length > 0)
      return PieceMovability.FALSE;
      
    // Check if piece reached goal
    if (document.querySelector("#board div[role='goal'][data-x='" + x + "'][data-y='" + y + "']"))
      return PieceMovability.GOAL;

    // Check if piece may move to tile
    if (!!document.querySelector("#board div[role='tile'][data-x='" + x + "'][data-y='" + y + "']:not([data-restriction])")
        ||
        !!document.querySelector("#board div[role='tile'][data-restriction=''][data-x='" + x + "'][data-y='" + y + "']")
        ||
        !!document.querySelector("#board div[role='tile'][data-restriction='" + color +"'][data-x='" + x + "'][data-y='" + y + "']"))
      return PieceMovability.TRUE;
      
    // Else default to FALSE.
    return PieceMovability.FALSE;
  };
  
  function getItem(role, x, y) {
    return document.querySelector("#board div[role='" + role + "'][data-x='" + x + "'][data-y='" + y + "']");
  };
  
  function positionTiles() {
    tiles = document.querySelectorAll("#board div[role='tile'], #board div[role='goal'], #board div[role='home']");
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
  
  function createPieces() {
    var colors = 'gybr'.split('').slice(0, playerCount);
    colors.forEach(function(color) {
      var homes = document.querySelectorAll("div[role='home'][data-color='" + color + "']");
      Array.prototype.forEach.call(homes, function(home) {
        var piece = document.createElement('div');
        piece.setAttribute('role', 'piece');
        piece.setAttribute('data-x', home.getAttribute('data-x'));
        piece.setAttribute('data-y', home.getAttribute('data-y'));
        piece.setAttribute('data-color', home.getAttribute('data-color'));
        board.appendChild(piece);
      });
    });
  };
  
  function init() {
    var eventName = isTouch ? 'touchstart' : 'click';
    board.addEventListener(eventName, pieceSelectHandler, true);
    document.getElementById('dice').addEventListener(eventName, diceHandler, true);
    
    positionTiles();
    playerCount = parseInt(prompt("Player count")) || 0;
    if (playerCount < 1 || playerCount > 4) { return; }
    currentPlayer = 0;
    createPieces();
    positionPieces();
  };
  
  init();
})(this)