var gameState

function State() {
	//an object holding the current game state

	this.currentPlayer = 1;
	this.players = ["red", "black"];
	this.madeMove = false;
	this.board = new Board(this.players);

	//a function to initially format the webpage game board
	this.format = function () {
		var t = document.getElementById("board");
		var colors = ["black", "red"]
		var colorindex = 1
		var spaces = gameState.board.spaces
		for (var y = 0; y < spaces.length; y++) {
			for (var x = 0; x < spaces[0].length; x++) {
				var space = spaces[y][x]
				var cell = document.createElement("div");
				cell.classList.add("square");
				cell.id = space.id;
				t.appendChild(cell);
			}
		}
		renderBoard();
	};

	//a function to return a html element for the current player
	this.renderPlayer = function () {
		var color = this.players[this.currentPlayer];
		var playerName = (color === "black") ? 1 : 2;

		var html = "Player " + playerName + " (" + color + ")";

		var div = document.createElement("div");
		div.id = "curPlayer";
		div.innerHTML = html;
		div.style.color = color;
		return div;
	};

	//a function to change control to the other player
	this.changePlayer = function () {
		this.currentPlayer = (this.currentPlayer + 1) % 2;
	};
}

function Board(players) {
	//an object that holds the game board data

	//initialize the game spaces
	var arr = new Array(8);
	var pieceArr = new Array(24);
	for (var i = 0; i < 8; i++) {
		arr[i] = new Array(8);
	}
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			var color;
			var valid;
			if (i % 2 == j % 2) {
				color = "red";
				valid = false;
			} else {
				color = "black";
				valid = true;
			}
			arr[i][j] = new Space(j, i, color, valid);
		}
	}

	//set up the player pieces on the board
	for (var p = 0; p < players.length; p++) {
		var startx;
		var starty;
		var dif;
		var pieces = 12;
		if (p === 0) {
			startx = 0;
			starty = 0;
			dif = 1;
		} else {
			startx = 7;
			starty = 7;
			dif = -1;
		}

		var x = startx;
		var y = starty;
		while (pieces > 0) {
			if (arr[y][x].valid) {
				var newPiece = new Piece(players[p], x, y);
				arr[y][x].piece = newPiece;
				pieces--;
			}
			x += dif;
			if (x < 0 || x > 7) {
				x = startx;
				y += dif;
			}
		}

	}

	this.spaces = arr;
	this.selected = null;
}

function Space(x, y, color, valid, canMoveTo) {
	//an object representing a space on the board

	//coordinates
	this.x = x;
	this.y = y;
	this.id = String.fromCharCode("A".charCodeAt() + x) + (y + 1);

	//only black spaces are valid
	this.valid = valid;
	this.color = color;

	//the piece at this space, if any
	this.piece = null;

	//whether or not this space can be moved/attacked to by the currently selected piece
	this.canMoveTo = false;
	this.canAttackTo = false;
}

function Piece(color, x, y) {
	//an object representing a game piece

	//current coordinates
	this.x = x;
	this.y = y;

	this.color = color;
	this.isKing = false;

	//return an svg rendering of the piece
	this.render = function () {
		var outline = (this.isKing) ? "gold" : "grey";
		var fill = (this.color === "red") ? "crimson" : "black";
		var circle = "<circle cx='20' cy='20' r='15' stroke='" + outline + "' stroke-width='2' fill='" + fill + "' />"
		var selRect = "";
		if (gameState.board.selected != null && this === gameState.board.selected.piece) {
			selRect = "<rect width='40' height='40' style='fill:darkblue' />";
		}
		var svg = "<svg>" + selRect + circle + "</svg>"
		return svg
	};

	//get an array of spaces that this piece can attack to
	this.canAttack = function () {
		var spaces = gameState.board.spaces;
		var y = this.y;
		var x = this.x;
		var xMoveDirs = [-1, 1];
		if (this.isKing) {
			var yMoveDirs = [-1, 1];
		} else if (this.color === "red") {
			var yMoveDirs = [1];
		} else {
			var yMoveDirs = [-1];
		}

		var targets = []

		var dy, dx, newx, newy;
		for (var i = 0; i < yMoveDirs.length; i++) {
			dy = yMoveDirs[i];
			for (var j = 0; j < xMoveDirs.length; j++) {
				dx = xMoveDirs[j];

				if (y + dy <= 7 && y + dy >= 0 && x + dx <= 7 && x + dx >= 0) {
					var neighbor = spaces[y + dy][x + dx];

					if (neighbor.piece != null) {
						if (y + dy * 2 <= 7 && y + dy * 2 >= 0 && x + dx * 2 <= 7 && x + dx * 2 >= 0 && neighbor.piece.color != this.color) {

							var target = spaces[y + dy * 2][x + dx * 2];

							if (target.piece == null) {
								targets += [target];
							}
						}
					}
				}
			}
		}
		return targets;
	};
}

function renderBoard() {
	var spaces = gameState.board.spaces

	var playerDiv = document.getElementById("curPlayer");
	playerDiv.html = gameState.renderPlayer().html;
	playerDiv.parentElement.replaceChild(gameState.renderPlayer(), playerDiv);

	for (var y = 0; y < spaces.length; y++) {
		for (var x = 0; x < spaces[0].length; x++) {
			var space = spaces[y][x]
			var cell = document.getElementById(space.id);
			cell.style.backgroundColor = space.color;

			cell.removeEventListener("click", move);
			cell.removeEventListener("click", clickChecker);
			cell.removeEventListener("click", attack);

			if (space.piece != null) {
				cell.innerHTML = space.piece.render();
				if (!gameState.madeMove) {
					cell.addEventListener("click", clickChecker)
				}
			} else {
				cell.innerHTML = ""
				if (space.canMoveTo === true) {
					cell.style.backgroundColor = "blue";
					cell.addEventListener("click", move)
				} else if (space.canAttackTo === true) {
					cell.style.backgroundColor = "blue";
					cell.addEventListener("click", attack)
				}
			}

		}
	}
}

function attack(evt) {
	var id = evt.target.id;
	var x = id.charCodeAt(0) - "A".charCodeAt();
	var y = id.charCodeAt(1) - "1".charCodeAt();
	var spaces = gameState.board.spaces;
	var sely = gameState.board.selected.piece.y;
	var selx = gameState.board.selected.piece.x;

	var midy = Math.round((sely + y) / 2)
	var midx = Math.round((selx + x) / 2)
	spaces[midy][midx].piece = null;

	spaces[y][x].piece = gameState.board.selected.piece;
	gameState.board.selected.piece = null;
	spaces[y][x].piece.x = x;
	spaces[y][x].piece.y = y;

	clearPossible();
	if (spaces[y][x].piece.canAttack().length > 0) {
		gameState.madeMove = true;
		highlightPossible(document.getElementById(spaces[y][x].id));
	} else {
		gameState.board.selected = null;
		gameState.madeMove = false;

		if (y === 0 || y === gameState.board.spaces.length - 1) {
			spaces[y][x].piece.isKing = true;
		}

		gameState.changePlayer();
	}

	console.log(gameState.madeMove)




	renderBoard();
}

function move(evt) {
	var id = evt.target.id;
	var x = id.charCodeAt(0) - "A".charCodeAt();
	var y = id.charCodeAt(1) - "1".charCodeAt();
	var spaces = gameState.board.spaces;
	spaces[y][x].piece = gameState.board.selected.piece;
	gameState.board.selected.piece = null;
	spaces[y][x].piece.x = x;
	spaces[y][x].piece.y = y;
	gameState.board.selected = null;

	if (y === 0 || y === gameState.board.spaces.length - 1) {
		spaces[y][x].piece.isKing = true;
	}

	gameState.changePlayer();
	clearPossible();
	renderBoard();
}

function clickChecker(evt) {
	highlightPossible(evt.target);
}

function clearPossible() {
	var spaces = gameState.board.spaces;
	for (var i = 0; i < spaces.length; i++) {
		for (var j = 0; j < spaces[i].length; j++) {
			spaces[i][j].canMoveTo = false;
			spaces[i][j].canAttackTo = false;
		}
	}
}

function highlightPossible(tgt) {
	if (tgt.id != "") {
		clearPossible();

		var id = tgt.id;
		var x = id.charCodeAt(0) - "A".charCodeAt();
		var y = id.charCodeAt(1) - "1".charCodeAt();

		var spaces = gameState.board.spaces;

		if (spaces[y][x].piece.color === gameState.players[gameState.currentPlayer]) {
			gameState.board.selected = spaces[y][x];

			var xMoveDirs = [-1, 1];
			if (gameState.board.selected.piece.isKing) {
				var yMoveDirs = [-1, 1];
			} else if (gameState.board.selected.piece.color === "red") {
				var yMoveDirs = [1];
			} else {
				var yMoveDirs = [-1];
			}

			var dy, dx, newx, newy;
			for (var i = 0; i < yMoveDirs.length; i++) {
				dy = yMoveDirs[i];
				for (var j = 0; j < xMoveDirs.length; j++) {
					dx = xMoveDirs[j];
					if (y + dy <= 7 && y + dy >= 0 && x + dx <= 7 && x + dx >= 0) {
						if (spaces[y + dy][x + dx].piece == null) {
							if (!gameState.madeMove) {
								spaces[y + dy][x + dx].canMoveTo = true;
							}
						} else if (y + dy + dy <= 7 && y + dy + dy >= 0 && x + dx + dx <= 7 && x + dx + dx >= 0 && spaces[y + dy][x + dx].piece.color != gameState.board.selected.piece.color) {
							if (spaces[y + dy + dy][x + dx + dx].piece == null) {
								spaces[y + dy + dy][x + dx + dx].canAttackTo = true;
							}
						}
					}
				}
			}

			renderBoard();
		}

	} else {
		highlightPossible(tgt.parentElement)
	}
}

function newGame() {
    var htmlboard = document.getElementById("board");
    htmlboard.innerHTML = "";
    //renderBoard()
    gameState = new State;
    gameState.format()

} 

newGame();