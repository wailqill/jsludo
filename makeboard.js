(function(doc) {

  function makeTile(tileStr, x, y) {
      var sprints = {
      },
      colors = {
          "r": true,
          "g": true,
          "b": true,
          "y": true
      },
      directions = {
          ">": true,
          "^": true,
          "<": true,
          "v": true
      },
      posObj = {
          x: x,
          y: y,
          str: tileStr,
          sprint: "",
          color: "",
          direction: "",
          restriction: "",
          role: "tile"
      },
      i;
      for (i=0;i<2;i++) {
          var c = tileStr[i];
          if (sprints[c]) {
              posObj.direction += c;
              posObj.sprint = c;
          }
          if (colors[c]) {
              posObj.color = c;
          }
          if (directions[c]) {
              posObj.direction += c;
          }
          if (c==="!") {
              posObj.role = "goal";
          }
      }
      if (posObj.color && posObj.sprint) {
          posObj.restriction = posObj.color;
      }
      return posObj;
  }

  function makeLine (line, y) {
      var x, myArray = [];
      for (x=0; x < line.length/3; x++) {
          var pos = line.substr(x*3,(x+1)*3);
          myArray.push(makeTile(pos, x, y));
      }
      return myArray;
  }

  function makeBoard (board) {
      var myArray = [], lineObj;
      var y = 0;
      for (y=0; y<board.length;y++) {
          lineObj = makeLine (board[y], y);
          myArray.push(lineObj);
      }
      return myArray;
  }

  function board2html (board) {
      var html = "", y, x;
      for (y = 0; y < board.length; y++) {
          for (x = 0; x < board[y].length; x++) {
              html += tile2html(board[y][x]);
          }
      }
      return html;
  }

  function tile2html (tile) {
      return (tile.direction) ? "<div " +
      " data-color='"+tile.color+
      "' data-restriction='"+tile.restriction+
      "' data-direction='" +tile.direction+
      "' role='" + tile.role + 
      "' data-x='" +tile.x+
      "' data-y='" +tile.y+
      "'></div>" : "";
  }
  
  var boardObject = makeBoard(layout);
  var html = board2html(boardObject);
  var div = doc.createElement('div');
  div.innerHTML = html;
  var board = doc.getElementById("board");
  for (var i=div.childNodes.length-1; i>=0; i--)
    board.appendChild(div.childNodes[i]);

})(document);