//JSPG vars
var JSPG = {}; //Joe's Shortest Path Game

var kongregate = parent.kongregate;

JSPG.startTime = (new Date()).getTime();
JSPG.clockTime = 0;

JSPG.mouse = "up";

JSPG.renderBox = [0,0,0,0];

JSPG.maxLevel = 1;
JSPG.level = JSPG.maxLevel;
JSPG.map = {};

JSPG.font = 'Verdana'; //Default font before new one loaded

//State bools
JSPG.dirtyCanvas = true;  //Keep track of when state has changed and need to update canvas

JSPG.gameInProgress = false;
JSPG.wonGame = false;

JSPG.toSaveGame = true;

window.onload = function(){

	JSPG.startSession();

	//Main loop
	//TODO: use request animation frame
	window.setInterval(function(){
		var start = JSPG.clockTime;
		// while(JSPG.clockTime - start < JSPG.refreshRate / 1000){
		// 	JSPG.iterations++;
		// };

		if(JSPG.dirtyCanvas){

			JSPG.dirtyCanvas = false;

			JSPG.drawBackground();		

			JSPG.drawGame();

			if(JSPG.checkWon && !JSPG.wonGame){
				JSPG.checkWon = false;
				if(JSPG.numIntersections){
					// console.log("Playing...");
				}else{
					// console.log("You Win!");
					JSPG.winGame();
				}
			}		

			//Save game
			if(JSPG.toSaveGame){
				JSPG.saveGameState();
				JSPG.toSaveGame = false;
			}
		}
	},0);
};

JSPG.startGame = function(){
	JSPG.map = {};
	JSPG.dirtyCanvas = true;
	JSPG.wonGame = false;

	JSPG.map = JSPG.createMap();

	JSPG.saveGameState();
};

JSPG.loadGameState = function() {
	if (!supports_html5_storage()) { return false; }
	JSPG.gameInProgress = (localStorage["JSPG.gameInProgress"] == "true");

	if(JSPG.gameInProgress){
		JSPG.maxLevel = parseInt(localStorage["JSPG.maxLevel"]);
		JSPG.wonGame = (localStorage["JSPG.wonGame"] == "true");
		JSPG.level = parseInt(localStorage["JSPG.level"]);
		JSPG.map = JSON.parse(localStorage["JSPG.map"]);
	}
}

JSPG.saveGameState = function() {
	if (!supports_html5_storage()) { return false; }
	// localStorage["JSPG.gameInProgress"] = true; //temp disable for testing

	localStorage["JSPG.maxLevel"] = JSPG.maxLevel;
	localStorage["JSPG.wonGame"] = JSPG.wonGame;
	localStorage["JSPG.level"] = JSPG.level;

	localStorage["JSPG.map"] = JSON.stringify(JSPG.map);
}

JSPG.startSession = function(){
	JSPG.canvas = document.getElementById("gameCanvas");
	JSPG.ctx = JSPG.canvas.getContext("2d");
	
	var w = JSPG.canvas.width;
	var h = JSPG.canvas.height;

	JSPG.renderBox = [20,20,w-20,h-20];

	JSPG.loadGameState();

	//Start new game
	if(!JSPG.gameInProgress){
		JSPG.startGame();
	}

	JSPG.dirtyCanvas = true;

	JSPG.initEvents();
}

JSPG.internalToRenderSpace = function(x,y){
	var xRender = (x + 1) * JSPG.getRenderBoxWidth() / 2  + JSPG.renderBox[0];
	var yRender = (y + 1) * JSPG.getRenderBoxHeight() / 2 + JSPG.renderBox[1];
	return [xRender,yRender];
};

JSPG.renderToInternalSpace = function(x,y){
	var xInternal = 2 * (x - JSPG.renderBox[0]) / JSPG.getRenderBoxWidth()  - 1;
	var yInternal = 2 * (y - JSPG.renderBox[1]) / JSPG.getRenderBoxHeight() - 1;
	return [xInternal,yInternal];
};

JSPG.arrayColorToString = function(color){
	return "rgb("+Math.round(color[0])+","+Math.round(color[1])+","+Math.round(color[2])+")";
};

JSPG.getRenderBoxWidth  = function(){return JSPG.renderBox[2] - JSPG.renderBox[0];};
JSPG.getRenderBoxHeight = function(){return JSPG.renderBox[3] - JSPG.renderBox[1];};
JSPG.mouseDown = function(){return JSPG.mouse === "down";};
JSPG.mouseUp = function(){return JSPG.mouse === "up";};


JSPG.drawGame = function(){
	JSPG.drawMap();
};

JSPG.drawMap = function(){
	var ctx = JSPG.ctx;
	ctx.save();

	var w = JSPG.canvas.width;
	var h = JSPG.canvas.height;

	var renderWidth  = JSPG.getRenderBoxWidth();
	var renderHeight = JSPG.getRenderBoxHeight();

	var boxWidth = renderWidth / JSPG.map.w;
	var boxHeight = renderHeight / JSPG.map.h;

	var xStart = JSPG.renderBox[0];
	var yStart = JSPG.renderBox[1];

	var x,y;
	var index;
	var color,tileValue,tileType;

	for(y = 0; y < JSPG.map.h; y++){
		for(x = 0; x < JSPG.map.w; x++){
			index = x+y*JSPG.map.w;
			xDraw = xStart + x * boxWidth;
			yDraw = yStart + y * boxHeight;

			tileValue = JSPG.map[index].value;
			tileType  = JSPG.map[index].type;

			color = [2.5*tileValue,0,0];

			if(tileType == "start"){
				color = [0,255,0];
			}else if(tileType == "finish"){
				color = [0,0,255];
			}

			ctx.fillStyle = JSPG.arrayColorToString(color);

			ctx.fillRect(xDraw,yDraw,boxWidth,boxHeight);
		}
	}

	ctx.restore();
};

JSPG.mousemove = function(x,y){
	
};

JSPG.mousedown = function(x,y){
	JSPG.mouse = "down";

};

JSPG.mouseup = function(x,y){
	JSPG.mouse = "up";
	
};

JSPG.drawBackground = function(){
	var ctx = JSPG.ctx;
	ctx.save();

	ctx.clearRect(0,0,JSPG.canvas.width,JSPG.canvas.height);

	var grd;

	grd = ctx.createLinearGradient(JSPG.renderBox[0],JSPG.renderBox[1],JSPG.getRenderBoxWidth(),JSPG.getRenderBoxHeight()/2);
	grd.addColorStop(0, 'rgb(149,215,236)');
	grd.addColorStop(1, 'rgb(29,141,178)');

	ctx.fillStyle = grd;
	ctx.fillRect(JSPG.renderBox[0],JSPG.renderBox[1],JSPG.getRenderBoxWidth(),JSPG.getRenderBoxHeight());		

	//Box border
	ctx.beginPath();
    ctx.moveTo(JSPG.renderBox[0]-0.5,JSPG.renderBox[1]-0.5);
    ctx.lineTo(JSPG.renderBox[0]-0.5,JSPG.renderBox[3]+0.5);
    ctx.lineTo(JSPG.renderBox[2]+0.5,JSPG.renderBox[3]+0.5);
    ctx.lineTo(JSPG.renderBox[2]+0.5,JSPG.renderBox[1]-0.5);
    ctx.lineTo(JSPG.renderBox[0]-0.5,JSPG.renderBox[1]-0.5);
    ctx.closePath();
    ctx.strokeStyle = '000';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
};

JSPG.winGame = function(){
	if(JSPG.level == JSPG.maxLevel){
		JSPG.maxLevel++;

		if(typeof kongregate !== "undefined"){
			kongregate.stats.submit("Max Level",JSPG.maxLevel-4);
		}

	}

	JSPG.wonGame = true;
};


// *** Events ***
JSPG.initEvents = function(){
	$(document).mouseup(function (e) {
		var offset = $("#gameCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		//Convert to internal coord system
		var internalPoint = JSPG.renderToInternalSpace(x,y);
		x = internalPoint[0];
		y = internalPoint[1];

		JSPG.mouseup(x,y);
	});

	$(document).mousedown(function (e) {
		var offset = $("#gameCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		//Convert to internal coord system
		var internalPoint = JSPG.renderToInternalSpace(x,y);
		x = internalPoint[0];
		y = internalPoint[1];
		
		JSPG.mousedown(x,y);
	});

	$(document).mousemove(function (e) {
		var offset = $("#gameCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		//Convert to intenal coord system
		var internalPoint = JSPG.renderToInternalSpace(x,y);
		x = internalPoint[0];
		y = internalPoint[1];

		JSPG.mousemove(x,y);
	});

	$(document).keypress(function (e) {
		console.log("keypress: ", e.charCode);

		//112 = 'p'
		//114 = 'r'
		//115 = 's'
	});
};

// *** Fonts ***
WebFontConfig = {
	google: { families: [ 'Libre+Baskerville::latin' ] },
	active: function() {
		JSPG.font = "Libre Baskerville";
		JSPG.dirtyCanvas = true;
	}
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

// *** LocalStorage Check ***
function supports_html5_storage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}