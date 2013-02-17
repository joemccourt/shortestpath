JSPG.createMap = function(){
	var map = {};

	var w = 10;
	var h = 10;

	map.w = w;
	map.h = h;

	map.start = [0,3];
	map.finish = [9,5];

	map.tiles = [];

	//Random map for now
	var x,y;
	var index;
	var value,type;
	for(y = 0; y < h; y++){
		for(x = 0; x < w; x++){
			index = x+w*y;
			map[index] = {};

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

	return map;
};

JSPG.setTileValue = function(map,x,y,value){
	map[x+y*map.w].value = value;	
};

JSPG.setTileType = function(map,x,y,type){
	map[x+y*map.w].type = type;	
};

JSPG.findShortestPath = function(map){
	if(typeof map !== "object"){map = JSPG.map;}

};