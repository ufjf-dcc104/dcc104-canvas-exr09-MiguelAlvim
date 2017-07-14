function GridMap(){
	this.map = {};
	this.objects = {};
	this.h=0;
	this.w=0;
	this.x=0;
	this.y=0;
	this.cellColorCode = {};
	this.drawSeparation = true;
	this.fullDraw = true;
	this.drawH=0;
	this.drawW=0;
}
GridMap.prototype.setSize = function(he,wi){
	this.h = he;
	this.w = wi;
}

GridMap.prototype.setObjectIn = function(obj,r,c){
	objects[r][c].push(obj);
}
GridMap.prototype.removeObjectIn = function(obj,r,c){
	for(var i=0;i<objects[r][c].length;i++){
		if(objects[r][c] == obj){
			objects[r][c].splice(i,1);
			break;
		}
	}
}
GridMap.prototype.getObjectsIn = function(obj,r,c){
	return objects[r][c];
}

GridMap.prototype.getRowCount = function(){
	return this.map.length;
}

GridMap.prototype.getRowColCount = function(r){
	return this.map[r].length;
}

GridMap.prototype.getYSize = function(){//Line Size
	return this.h/this.map.length;
}

GridMap.prototype.getXSize = function(r){//Colum size in line r
	return this.w/this.map[r].length;
}

GridMap.prototype.getXYByCell = function (r,c){
	var ySpace = this.getYSize();
	var xSpace = this.getXSize(r);
	return {mx: xSpace*c,my: ySpace*r};
}

GridMap.prototype.getCellValue = function (r,c){
	return this.map[r][c];
}
	
GridMap.prototype.getCellByXY = function (x,y){
	var row = -1;
	var col = -1;
	if(x>=0 && y>=0){
		row = Math.floor(y/this.getYSize());
		if(row < this.map.length && row >= 0){
			col = Math.floor(x/this.getXSize(row));
			if(col < this.map[row].length && col >= 0)
				return {row,col};
		}
	}
	row = -1;
	col = -1;
	return {row,col};
}

GridMap.prototype.setCellCount = function(x,y){
	this.map = new Array(y);
	this.objects = new Array(y);
	for(var	 i=0;i<y;i++){
		for(var j=0;j<x;j++){
			this.map[i] = new Array(x);
			this.map[i][j] =0;
			
			this.objects[i] = new Array(x);
			this.objects[i][j] =0;
		}
	}
}

GridMap.prototype.setCellValue = function(x,y,val){//Line,Coll,Value
	if(x<0 || x>=this.map.length || y<0 || y>=this.map[x].length)
		return;
	this.map[x][y] = val;
}

GridMap.prototype.setCellsValue = function(vals){//READS A FULL MAP AND WRITES IT
	this.map = new Array(vals.length);
	for(var i=0;i<vals.length;i++){//Lines
		this.map[i] = new Array(vals[i].length);
		for(var j=0;j<vals[i].length;j++){//Columns
			this.map[i][j] = vals[i][j];
		}
	}
}

GridMap.prototype.setColorCode = function(code,color) {
	this.cellColorCode[code] = color;
}

GridMap.prototype.setColorCodes = function(codes,colors) {
	for(var i=0;i<codes.length;i++){
		this.cellColorCode[codes[i]] = colors[i];
	}
}

GridMap.prototype.draw = function(ctx) {
	var xSpace=this.drawW;
	var ySpace=0;
	if(this.fullDraw){
		var xSpace=this.h/this.map.length;
	}
	var sepOfX = 0;
	var sepOfY = 0;
	if(!this.drawSeparation){
		sepOfX = 1;
		sepOfY = 1;
	}
	ctx.save();
	ctx.translate(this.x,this.y);
		for(var i=0;i<this.map.length;i++){//Line
			for(var j=0;j<this.map[i].length;j++){//Column
				if(this.fullDraw){
					ySpace = this.w/this.map[i].length;
				}else{
					ySpace = this.drawH;
				}
				ctx.fillStyle = this.cellColorCode[this.map[i][j]];
				ctx.fillRect(ySpace*j,xSpace*i,ySpace+sepOfY,xSpace+sepOfX);
			}
		}
	ctx.restore();
}
GridMap.prototype.collisionInFront = function(obj,cellCodes){//obj = object that will collide; cellCodes: Vector with all the cells values that will trigger a collision
	/*
		This fuction looks to the direction of the obj movement and checks if with it's actual speed the obj will reach any map cell that has one of the 
	codes in the array 'cellCodes'.
		Note: This function could be removed, as the 'collisionInDirection' function does the same if you pass a direction not included in [1,8];
			  We keep this one for legacy code.
	*/
	var currentCell = this.getCellByXY(obj.x,obj.y);
	if(currentCell.row<0 || currentCell.col<0)
		return false;
	var cellCmod = 0;
	if(obj.velx>0){
		cellCmod = 1;
	}else if(obj.velx<0){
		cellCmod = -1;
	}
	var cellRmod = 0;
	if(obj.vely>0){
		cellRmod = 1;
	}else if(obj.vely<0){
		cellRmod = -1;
	}
	var ahead;
	if(cellCmod !=0 || cellRmod !=0){
		//Checking in each extreme collision point	
		if(typeof obj.collisionPoints === "object"){
			for(var i =0;i<obj.collisionPoints.length;i++){
				currentCell = this.getCellByXY(obj.x+obj.collisionPoints[i].x,obj.y+obj.collisionPoints[i].y);
				ahead = this.getCellByXY((obj.x+obj.collisionPoints[i].x+obj.velx),(obj.y+obj.collisionPoints[i].y+obj.vely));	
				if(ahead.row>=0 && ahead.col>=0 && ahead.row < this.map.length && ahead.col < this.map[ahead.row].length){
					if(cellCodes.includes(this.map[ahead.row][ahead.col])){
						return true;
					}
				}
			}
		}
		//Checking from the center to the edge
		ahead = this.getCellByXY(((obj.x+(obj.w*cellCmod/2))+obj.velx),(obj.y+(obj.h*cellRmod/2)+obj.vely));
		if(ahead.row>=0 && ahead.col>=0 && ahead.row<this.map.length && ahead.col<this.map[ahead.row].length){
			if(cellCodes.includes(this.map[ahead.row][ahead.col])){
				return true;
			}else{
				var current = this.getCellByXY((obj.x),(obj.y));
				var aheadX = {row:ahead.row,col:current.col};
				var aheadY = {row:current.row,col:ahead.col};
				return ((cellCodes.includes(this.map[aheadX.row][aheadX.col])) && (cellCodes.includes(this.map[aheadY.row][aheadY.col])));
			}
		}
	}
	return false;
}
GridMap.prototype.collisionInDirection = function(obj,cellCodes,dir){
	/*Same as above, but only checks on a direction;
		Dir -> [1,8]
			Checks on that direction
		If dir not in [1,8]
			Checks all directions(same as calling the fucntion 'collisionInFront')
				 	
			 6	 7   8
			  \	 |  /
			5 - obj - 1
			  /  |  \
	         4   3   2
	*/
	var currentCell = this.getCellByXY(obj.x,obj.y);
	if(currentCell.row<0 || currentCell.col<0)
		return false;
	var cellCmod = 0;
	var cellRmod = 0;
	switch(dir){
		case 1:{
			cellCmod =1;
		}break;
		case 2:{
			cellCmod =1;
			cellRmod =1;
		}break;
		case 3:{
			cellRmod =1;
		}break;
		case 4:{
			cellCmod =-1;
			cellRmod =1;
		}break;
		case 5:{
			cellCmod =-1;
		}break;
		case 6:{
			cellCmod =-1;
			cellRmod =-1;
		}break;
		case 7:{
			cellRmod =-1;
		}break;
		case 8:{
			cellCmod =1;
			cellRmod =-1;
		}break;		
		default:{
			// return this.collisionInFront(bj,cellCodes);
			if(obj.velx>0){
				cellCmod = 1;
			}else if(obj.velx<0){
				cellCmod = -1;
			}
			if(obj.vely>0){
				cellRmod = 1;
			}else if(obj.vely<0){
				cellRmod = -1;
			}	
		}break;		
	}
	var ahead;
	if(cellCmod !=0 || cellRmod !=0){
		//Checking in each extreme collision point	
		if(typeof obj.collisionPoints === "object"){
			for(var i =0;i<obj.collisionPoints.length;i++){
				currentCell = this.getCellByXY(obj.x+obj.collisionPoints[i].x,obj.y+obj.collisionPoints[i].y);
				ahead = this.getCellByXY((obj.x+obj.collisionPoints[i].x+obj.velx*Math.abs(cellCmod)),(obj.y+obj.collisionPoints[i].y+obj.vely*Math.abs(cellRmod)));	
				if(ahead.row>=0 && ahead.col>=0 && ahead.row < this.map.length && ahead.col < this.map[ahead.row].length){
					if(cellCodes.includes(this.map[ahead.row][ahead.col])){
						return true;
					}
				}
			}
		}
		//Checking from the center to the edge
		ahead = this.getCellByXY(((obj.x+(obj.w*cellCmod/2))+obj.velx*Math.abs(cellCmod)),(obj.y+(obj.h*cellRmod/2)+obj.vely*Math.abs(cellRmod)));
		if(ahead.row>=0 && ahead.col>=0 && ahead.row<this.map.length && ahead.col<this.map[ahead.row].length){
			if(cellCodes.includes(this.map[ahead.row][ahead.col])){
				return true;
			}else{
				var current = this.getCellByXY((obj.x),(obj.y));
				var aheadX = {row:ahead.row,col:current.col};
				var aheadY = {row:current.row,col:ahead.col};
				return ((cellCodes.includes(this.map[aheadX.row][aheadX.col])) && (cellCodes.includes(this.map[aheadY.row][aheadY.col])));
			}
		}
	}
	return false;
}