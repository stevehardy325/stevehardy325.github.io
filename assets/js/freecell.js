const ranksConv = {
	ace: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	10: 10,
	jack: 11,
	queen: 12,
	king: 13
};

const suitColor = {
	spades: "black",
	clubs: "black",
	hearts: "red",
	diamonds: "red"
};

let gameState;

newGame();

function newGame() {
	gameState = new Game();
	render();
}

function Card(rank, suit) {
	this.rank = rank;
	this.suit = suit;
	this.id = `${rank}-of-${suit}`;
	this.location = null;

	this.minus = function(other) {
		return ranksConv[this.rank] - ranksConv[other.rank];
	};

	this.src = function() {
		return `/assets/images/svg-cards/${this.rank}_of_${this.suit}.svg.min.svg`;
	}
}

function Cascade() {
	this.cards = [];

	this.addCard = function(card) {
		this.cards.push(card);
	};

	this.topCard = function() {
		let topCard;
		if (this.cards.length > 0) {
			topCard = this.cards[this.cards.length - 1];
		}
		return topCard;
	};

	this.pop = function() {
		return this.cards.pop();
	};

	this.canMoveTo = function(card) {
		let canDo = false;
		if (this.cards.length === 0) {
			canDo = true;
		} else {
			let topCard = this.cards[this.cards.length - 1];
			if (suitColor[topCard.suit] !== suitColor[card.suit] && card.minus(topCard) == -1) {
				canDo = true;
			}
		}
		return canDo;
	}
}

function Foundation() {
	this.cards = [];

	this.canMoveTo = function(card) {
		let canDo = false;
		if (this.cards.length === 0) {
			if (ranksConv[card.rank] == 1) {
				canDo = true;
			}
		} else {
			let topCard = this.cards[this.cards.length - 1];
			if (topCard.suit === card.suit && card.minus(topCard) == 1) {
				canDo = true;
			}
		}
		return canDo;
	};

	this.addCard = function(card) {
		this.cards.push(card);
	};
}

function Cell() {
	this.card = null;

	this.canMoveTo = function(card) {
		let canDo = false;
		if (this.card == null) {
			canDo = true;
		}
		return canDo;
	};

	this.addCard = function(card) {
		this.card = card;
	};

	this.pop = function() {
		let card = this.card;
		this.card = null;
		return card;
	}
}

function Game() {
	this.cascades = [];
	this.foundations = [];
	this.cells = [];

	for (i = 0; i < 8; i++) {
		let cascade = new Cascade();
		this.cascades.push(cascade);
		this[`cascade_${i}`] = cascade;
	}
	for (i = 0; i < 4; i++) {
		let foundation = new Foundation();
		this.foundations.push(foundation);
		this[`foundation_${i}`] = foundation;

		let cell = new Cell();
		this.cells.push(cell);
		this[`cell_${i}`] = cell;
	}

	let deck = new Deck();
	deck.shuffle();
	let cascadeNum = 0;
	let initDeckLen = deck.length();
	for (i = 0; i < initDeckLen; i++) {
		let card = deck.pop();

		this.cascades[cascadeNum].addCard(card);
		card.location = this.cascades[cascadeNum];
		cascadeNum = (cascadeNum + 1) % this.cascades.length;

		this[card.id] = card;
	}

}

function Deck() {
	let suits = ['spades', 'hearts', 'clubs', 'diamonds'];
	let ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'];
	this.cards = [];
	for (i = 0; i < ranks.length; i++) {
		for (j = 0; j < suits.length; j++) {
			let rank = ranks[i];
			let suit = suits[j];
			let c = new Card(rank, suit);
			this.cards.push(c);
		}
	}
	this.shuffle = function() {
		let newOrder = [];
		while (this.cards.length > 0) {
			let index = Math.floor(Math.random() * this.cards.length);
			newOrder.push(this.cards[index]);
			this.cards.splice(index, 1);
		}
		this.cards = newOrder;
	};
	this.length = function() {
		return this.cards.length;
	};
	this.pop = function() {
		return this.cards.pop();
	};
}

function render() {

	//render foundation area
	let foundationArea = document.getElementById("foundation-area");
	let foundationAreaClone = foundationArea.cloneNode(false);
	foundationAreaClone.innerHTML = '<div class="card-slot-area-tag">Foundations</div>'

	let foundations = gameState.foundations;
	for (i = 0; i < foundations.length; i++) {
		let foundationDiv = document.createElement("div");
		foundationDiv.id = `foundation_${i}`;
		foundationDiv.className = "foundation";

		let foundation = foundations[i];
		if (foundation.cards.length > 0) {
			let card = foundation.cards[foundation.cards.length - 1];
			let suit = card.suit;
			let rank = card.rank;

			let cardSVG = document.createElement("img");
			cardSVG.id = card.id;
			cardSVG.src = card.src();
			cardSVG.alt = `${rank} of ${suit}`;
			cardSVG.draggable = false;
			cardSVG.onmousedown = disableDragging;
			cardSVG.className = "card";
			foundationDiv.appendChild(cardSVG);
		}
		foundationAreaClone.appendChild(foundationDiv);
	}

	foundationArea.replaceWith(foundationAreaClone);

	//render cells
	let cellArea = document.getElementById("cell-area");
	let cellAreaClone = cellArea.cloneNode(false);
	cellAreaClone.innerHTML = '<div class="card-slot-area-tag">Cells</div>'

	let cells = gameState.cells;
	for (i = 0; i < cells.length; i++) {
		let cellDiv = document.createElement("div");
		cellDiv.id = `cell_${i}`;
		cellDiv.className = "cell";
		if (cells[i].card != null) {
			let card = cells[i].card;
			let suit = card.suit;
			let rank = card.rank;

			let cardSVG = document.createElement("img");
			cardSVG.id = card.id;
			cardSVG.src = card.src();
			cardSVG.alt = `${rank} of ${suit}`;
			cardSVG.draggable = false;
			cardSVG.onmousedown = disableDragging;
			cardSVG.className = "card";
			cellDiv.appendChild(cardSVG);
		}
		cellAreaClone.appendChild(cellDiv);
	}

	cellArea.replaceWith(cellAreaClone);

	//render cascades
	let cascadeArea = document.getElementById("cascade-area");
	let cascadeAreaClone = cascadeArea.cloneNode(false);
	let cascades = gameState.cascades;
	for (i = 0; i < cascades.length; i++) {
		let cascadeDiv = document.createElement("div");
		cascadeDiv.id = `cascade_${i}`;
		cascadeDiv.className = "cascade";

		let cards = cascades[i].cards;

		for (j = 0; j < cards.length; j++) {
			let card = cards[j];
			let suit = card.suit;
			let rank = card.rank;

			let cardSVG = document.createElement("img");
			cardSVG.id = card.id;
			cardSVG.src = card.src();
			cardSVG.alt = `${rank} of ${suit}`;
			cardSVG.draggable = false;
			cardSVG.onmousedown = disableDragging;
			cardSVG.className = "card";
			cardSVG.style.gridArea = `${j+1}/1/${j+8}/2`;
			cascadeDiv.appendChild(cardSVG);
		}

		cascadeAreaClone.appendChild(cascadeDiv);
	}
	cascadeArea.replaceWith(cascadeAreaClone);
	updateMovables();
}

function disableDragging(e) {
	e.preventDefault();
}

function updateMovables() {
	//remove all draggability
	$(".card").draggable().draggable("destroy");

	//only top cards are draggable
	let cascades = gameState.cascades;
	for (i = 0; i < cascades.length; i++) {

		let topCard = cascades[i].topCard();
		if (topCard !== undefined) {
			$("#" + topCard.id).draggable({
				stack: ".card",
				containment: $("#playing-area"),
				revert: 'invalid',
				revertDuration: 200
			});
		}


	}

	//cell cards are draggable
	let cells = gameState.cells;
	for (i = 0; i < cells.length; i++) {

		let card = cells[i].card;
		if (card !== undefined && card !== null) {
			$("#" + card.id).draggable({
				stack: ".card",
				containment: $("#playing-area"),
				revert: 'invalid',
				revertDuration: 200
			});
		}


	}

	$('.foundation').droppable({
		accept: dropAcceptCheck,
		drop: dropListener
	});
	$('.cell').droppable({
		accept: dropAcceptCheck,
		drop: dropListener
	});
	$('.cascade').droppable({
		accept: dropAcceptCheck,
		drop: dropListener
	});
}

function dropAcceptCheck(dropped) {
	let droppedOn = $(this);
	let droppedId = dropped.attr("id");
	let targetId = droppedOn.attr("id");

	let card = gameState[droppedId];
	let target = gameState[targetId];

	if (target.canMoveTo(card)) {

		return true;
	} else {
		return false;
	}

	return false;

}

function dropListener(ev, ui) {
	let dropped = ui.draggable;
	let droppedOn = $(this);
	let droppedId = dropped.attr("id");
	let targetId = droppedOn.attr("id");

	let card = gameState[droppedId];
	let target = gameState[targetId];

	let oldLocation = card.location;
	oldLocation.pop();

	target.addCard(gameState[droppedId]);
	card.location = target;

	render();
}