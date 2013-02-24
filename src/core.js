JSPG.createMap = function(){
	var map = {};

	var w = 20;
	var h = 20;

	map.w = w;
	map.h = h;

	map.start = [0+5,h/2|0];
	map.finish = [w-1-5,h/2|0];

	map.tiles = [];

	//Random map for now
	var x,y;
	var index;
	var value,type;
	for(y = 0; y < h; y++){
		for(x = 0; x < w; x++){
			index = x+w*y;
			map.tiles[index] = {};

			value = 5*Math.floor(20*Math.random());  //intervals of 5
			type = "normal";

			if(x == map.start[0] && y == map.start[1]){
				value = 0;
				type = "start";
			}
			
			if(x == map.finish[0] && y == map.finish[1]){
				value = 0;
				type = "finish";
			}

			JSPG.setTileValue(map,x,y,value);
			JSPG.setTileType(map,x,y,type);
		}
	}

	map.shortestPath = JSPG.findShortestPath(map);
	return map;
};

JSPG.setTileValue = function(map,x,y,value){
	map.tiles[x+y*map.w].value = value;	
};

JSPG.setTileType = function(map,x,y,type){
	map.tiles[x+y*map.w].type = type;	
};


// A rather basic implementation of Dijkstra's algorithm
// A* seach would probably be faster, but this is fast enough
// for the sized maps I plan to use
JSPG.findShortestPath = function(map){
	if(typeof map !== "object"){map = JSPG.map;}

	var nodes = map.tiles;
	var paths = [];

	var w = map.w;
	var h = map.h;
	var index;
	
	// Init paths
	var i;
	for(i = 0; i < map.tiles.length; i++){
		paths[i] = {previousNode:-1,pathValue:0,value:nodes[i].value,updated:false,reached:false}
	}

	// Start
	index = map.start[0] + w*map.start[1];
	paths[index] = {previousNode:-1,pathValue:0,value:0,updated:true,reached:true};

	var finishedSearch = false;
	var path;
	var x,y;
	while(!finishedSearch){
		finishedSearch = true;

		for(i = 0; i < nodes.length; i++){
			path = paths[i];
			if(path.reached){
				if(path.updated){

					path.updated = false;

					x = i % w;
					y = i / w | 0;

					//Expand to neighbors
					var k; //left,up,right,down
					for(k = 0; k < 4; k++){
						if(k == 0){
							if(x == 0){continue;}
							index = x - 1 + y*w;
						}else if(k == 1){
							if(y == 0){continue;}
							index = x + (y-1)*w;
						}else if(k == 2){
							if(x == w-1){continue;}
							index = x + 1 + y * w;
						}else if(k == 3){
							if(y == h-1){continue;}
							index = x + (y+1)*w;
						}

						//If doesn't exist or shorter, update path
						if(!paths[index].reached || path.pathValue+paths[index].value < paths[index].pathValue){
							paths[index].previousNode = i;
							paths[index].updated = true;
							paths[index].reached = true;
							paths[index].pathValue = path.pathValue+paths[index].value;

							finishedSearch = false;
						}
					}
				}
			}
		}
	}

	//Build final path array
	//Iterating backwards
	var path = [];
	var index = map.finish;
	var startIndex = map.start[0]+w*map.start[1];
	var finishIndex = map.finish[0]+w*map.finish[1];
	var lastNodeIndex = finishIndex;
	
	var i = 0;
	while(lastNodeIndex != startIndex && lastNodeIndex != -1){

		path[i] = [lastNodeIndex%w,lastNodeIndex/w|0];

		lastNodeIndex = paths[lastNodeIndex].previousNode;

		i++;
		if( i > 10000){break;} //safety
	}

	path[i] = [startIndex%w,startIndex/w|0];

	return path.reverse();
};