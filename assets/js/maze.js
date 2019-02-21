let gamePosition = {
	x: 0,
	y: 0,
	board: null
};

function renderBoard(board) {
	let mazeCont = document.getElementById("maze-container");
	let newMazeCont = mazeCont.cloneNode(true);
	let size = board.length;
	newMazeCont.innerHTML = "";
	newMazeCont.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

	board.forEach(function(row) {
		row.forEach(function(obj) {
			let space = document.createElement("div");
			space.className = "maze-space";
			space.id = `space_x${obj.x}_y${obj.y}`;
			if (obj.start) {
				//space.innerHTML = "S"
			} else if (obj.end) {
				//space.innerHTML = "E"
			}
			if (obj.openN) {
				space.classList.add("openN");
			}
			if (obj.openS) {
				space.classList.add("openS");
			}
			if (obj.openE) {
				space.classList.add("openE");
			}
			if (obj.openW) {
				space.classList.add("openW");
			}
			newMazeCont.appendChild(space);
		});
	});



	mazeCont.replaceWith(newMazeCont);
	drawCurrentPos();
}



function generateSpaces(size) {
	let board = [];
	let i = 0;
	let val = 0;
	while (i < size) {
		let boardRow = [];
		let j = 0;
		while (j < size) {
			spaceObj = {
				'id': val,
				'x': j,
				'y': i,
				'openN': false,
				'openS': false,
				'openE': false,
				'openW': false
			};

			if (i == 0 && j == 0) {
				spaceObj.start = true;
			} else {
				spaceObj.start = false;
			}

			if (i == size - 1 && j == size - 1) {
				spaceObj.end = true;
			} else {
				spaceObj.end = false;
			}

			boardRow.push(spaceObj);
			val = val + 1;
			j = j + 1;
		}
		board.push(boardRow);
		i = i + 1
	}

	return board;
}

function pickRandom(obj) {
	let keys = Object.keys(obj);
	return obj[keys[keys.length * Math.random() << 0]];
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getNeighbors(space, board) {
	let neighbors = []
	let x = space.x;
	let y = space.y;
	let max = board.length;

	for (i = -1; i <= 1; i++) {
		for (j = -1; j <= 1; j++) {
			if ((i == 0 || j == 0) && i != j) {
				if (i + y < max && j + x < max && i + y > -1 && j + x > -1) {
					neighbors.push({
						'x': j,
						'y': i
					});
				}
			}
		}
	}
	return neighbors;
}

function generateMaze(board) {
	let frontier = {};
	let done = {}

	let x = getRandomInt(board.length);
	let y = getRandomInt(board.length);

	let first = board[y][x]

	done[first.id] = first;
	let neighbors = getNeighbors(first, board);
	for (i = 0; i < neighbors.length; i++) {
		let d = neighbors[i];
		let neighbor = board[d.y + y][d.x + x]
		frontier[neighbor.id] = neighbor;
	}

	while (Object.keys(frontier).length > 0) {
		space = pickRandom(frontier);
		let neighbors = getNeighbors(space, board);

		let doneNeighbors = []
		for (i = 0; i < neighbors.length; i++) {
			let d = neighbors[i];
			let neighbor = board[d.y + space.y][d.x + space.x];
			if (neighbor.id in done) {
				doneNeighbors.push(neighbor);
			} else {
				frontier[neighbor.id] = neighbor;
			}
		}

		let link = doneNeighbors[Math.floor(Math.random() * doneNeighbors.length)];

		if (space.y < link.y) {
			space.openS = true;
			link.openN = true;
		} else if (space.y > link.y) {
			space.openN = true;
			link.openS = true;
		} else if (space.x < link.x) {
			space.openE = true;
			link.openW = true;
		} else if (space.x > link.x) {
			space.openW = true;
			link.openE = true;
		}

		done[space.id] = space;
		delete frontier[space.id];

	}

	return board;
}

function createBoard(size) {
	let newBoard = generateSpaces(size);
	newBoard = generateMaze(newBoard);
	return newBoard
}

function newMaze(size) {
	let board = createBoard(size);
	gamePosition.x = 0;
	gamePosition.y = 0;
	gamePosition.board = board;
	renderBoard(board)
}

function moveUp() {
	let x = gamePosition.x;
	let y = gamePosition.y;
	if (gamePosition.board[y][x].openN) {
		clearCurrentPos()
		gamePosition.y = y - 1;
		drawCurrentPos();
	}
}

function moveDown() {
	let x = gamePosition.x;
	let y = gamePosition.y;
	if (gamePosition.board[y][x].openS) {
		clearCurrentPos()
		gamePosition.y = y + 1;
		drawCurrentPos();
	}

}

function moveRight() {
	let x = gamePosition.x;
	let y = gamePosition.y;
	if (gamePosition.board[y][x].openE) {
		clearCurrentPos()
		gamePosition.x = x + 1;
		drawCurrentPos();
	}

}

function moveLeft() {
	let x = gamePosition.x;
	let y = gamePosition.y;
	if (gamePosition.board[y][x].openW) {
		clearCurrentPos();
		gamePosition.x = x - 1;
		drawCurrentPos();
	}


}

function clearCurrentPos() {
	document.getElementById(`space_x${gamePosition.x}_y${gamePosition.y}`).style.backgroundColor = "white";
}

function drawCurrentPos() {
	document.getElementById(`space_x${gamePosition.x}_y${gamePosition.y}`).style.backgroundColor = "crimson";
}



window.onkeydown = function(e) {
	var key = e.key;
	console.log(key)

	switch (key) {
		case 'a': //left
			moveLeft();
			break;
		case 'w': //up
			moveUp()
			break;
		case 'd': //right
			moveRight()
			break;
		case 's': //down
			moveDown()
			break;
	}
	console.log(gamePosition)

}

newMaze(8);