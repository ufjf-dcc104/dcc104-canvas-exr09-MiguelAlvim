function Sprite(){
	//Bulding/Initial Variables
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.maskW = 0;
	this.maskH = 0;
	this.angle = 0;//0 - 360
	this.color = "blue";
	
	//Collision variables;
	this.collisionPoints = [];
	
	//Movement Variables
	this.turnSpeed = 0;
	this.turnAcc = 0;
	this.velx = 0;	
	this.vely = 0;	
	this.accx = 0;
	this.accy = 0;
	this.accangle =0;//USE THIS ONE IF YOU USE ANGLES TO CONTROL TE MOVEMENT DIRECTION(THIS IS THE ACC ON THE FOWARD POSITION, FOR EXAMPLE). ON THAT CASE, ACCX AND ACCY ARE INACCURATE (THEY CAN STILL BE USED FOR EXTERNAL ACC SOURCES, BUT NOT FOR MOVEMENT)
	this.stopVelX = 5;
	this.stopVelY = 5;
	this.maxVel = 8;//Hard Coded maximum vel, Not implemented
	this.accNaturalLimit = 2;//Maximum allowed acc from friction
	this.accCounterX=0;//Acceleration manipulated by the code only. It will stop the sprite naturally once standard acc reaches 0
	this.accCounterY=0;//Acceleration manipulated by the code only. It will stop the sprite naturally once standard acc reaches 0
	this.accGravityX =0;
	this.accGravityY =0;
	
	//Control Variables
	this.hasFrictionX = true;
	this.hasFrictionY = true;
	this.hasFrictionAngle = true;
	this.printCollisionPoints = false;
	this.printFowardDirection = false;
	this.fowardAdjustAngle = 0;//For triangles set to 90
	
	this.form = 0;//0 = square, 1 = isoceles triangle, 2 = circle
}
Sprite.prototype.calculateCollisionPoints = function(){//Uses the sprite shape to set up collision a set of points. DO NOT USE THOSE POINTS FOR CIRCULAR COLLISION. USE THE BUILD-IN circularColisionCheck
//IMPORTANT: IF ROTATION ANLGES ARE USED, RECALCULATE THE POINTS OR YOU'LL HAVE INACCURACIES
//THIS FUNCTION GIVES THE POINTS OF COLLISION IN A RELATIVE POSITION. THEY MUST BE ADDED TO X AND Y BEFORE BE USED
	var cos = Math.cos(this.angle*Math.PI/180);
	var sine = Math.sin(this.angle*Math.PI/180);
	var x=0;
	var y=0;
	this.collisionPoints.length = 0;
	var mod = 0.8;
	switch(this.form){
		case 1:{
				x = ((this.w/2)*cos  - ((this.h/2)*0.65)*sine)*mod;
				y = ((this.w/2)*sine + ((this.h/2)*0.65)*cos)*mod;			
			this.collisionPoints.push({x,y});
				x = ((-this.w/2)*cos  - ((this.h/2)*0.65)*sine)*mod;
				y = ((-this.w/2)*sine + ((this.h/2)*0.65)*cos)*mod;			
			this.collisionPoints.push({x,y});
				x = (((this.h/2)*1.35)*sine)*mod;
				y = (((-this.h/2)*1.35)*cos)*mod;			
			this.collisionPoints.push({x,y});
		}break;
		case 2:{
			//USE THE circularColisionCheck function
		}break;
		case 0:
		default:{
				x = ((-this.w/2)*cos  + (this.h/2)*sine)*mod;
				y = ((-this.w/2)*sine - (this.h/2)*cos)*mod;
			this.collisionPoints.push({x,y});
				x = ((-this.w/2)*cos  - (this.h/2)*sine)*mod;
				y = ((-this.w/2)*sine + (this.h/2)*cos)*mod;
			this.collisionPoints.push({x,y});
				x = ((this.w/2)*cos  - (this.h/2)*sine)*mod;
				y = ((this.w/2)*sine + (this.h/2)*cos)*mod;
			this.collisionPoints.push({x,y});
				x = ((this.w/2)*cos  + (this.h/2)*sine)*mod;
				y = ((this.w/2)*sine - (this.h/2)*cos)*mod;
			this.collisionPoints.push({x,y});			
		}break;
	}	
	// console.log("Collision Points: ");
	// for(var i =0;i<this.collisionPoints.length;i++)
		// console.log(this.collisionPoints[i].x + " "+ this.collisionPoints[i].y);
}

Sprite.prototype.addACCX = function (val){//ADDS THE VALUE TO accx
	this.accx +=val;
}

Sprite.prototype.addACCY = function (val){//ADDS THE VALUE TO accy
	this.accy +=val;
}

Sprite.prototype.circularColisionCheck = function (px,py){//Checks if point is inside a circle around the x,y point of the sprite
	//Euclidian distance
	var dist = Math.sqrt(Math.pow(px-this.x,2) + Math.pow(py-this.y,2));
	return dist <= Math.max(this.w/2,this.h/2);
}

Sprite.prototype.circularColisionCheckByMask = function (px,py){//Checks if point is inside a circle around the x,y point of the sprite; Using the MASKS SIZE
	//Euclidian distance
	var dist = Math.sqrt(Math.pow(px-this.x,2) + Math.pow(py-this.y,2));
	return dist <= Math.max(this.maskW/2,this.maskH/2);
}
Sprite.prototype.draw = function (ctx){
	ctx.save();
		ctx.translate(this.x,this.y);
		switch(this.form){
			case 1:{
				ctx.fillStyle = this.color;
				ctx.rotate(this.angle*Math.PI/180);
				ctx.beginPath();
					ctx.moveTo(this.w/2,(this.h/2)*0.65);
					ctx.lineTo(-this.w/2,(this.h/2)*0.65);				
					ctx.lineTo(0,(-this.h/2)*1.35);				
					ctx.lineTo(this.w/2,(this.h/2)*0.65);	
				ctx.fill();				
			}break;
			case 2:{
				
			}
			case 0:
			default:{
				ctx.fillStyle = this.color;
				ctx.rotate(this.angle*Math.PI/180);
				ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
			}
		}
		//Front poiting direction	
		ctx.strokeStyle ="BLACK";
		ctx.fillStyle ="BLACK";
		
		if(this.printFowardDirection){
			ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(this.w,0);	
			ctx.stroke();
		}
		
		if(this.printCollisionPoints){
			ctx.rotate(-this.angle*Math.PI/180);
			ctx.fillRect(-1,-1,1,1);//Center of the sprite
			for(var i =0;i<this.collisionPoints.length;i++){
				ctx.fillRect(this.collisionPoints[i].x,this.collisionPoints[i].y,1,1);//Center of the sprite
			}
		}
		
	ctx.restore()
};

Sprite.prototype.accLimiter = function (){//KEEPS THE ACCELERATION CREATED BY PLAYERS AND FRICTION IN THE LIMIT
	if (this.accx >0 && this.accx > this.accNaturalLimit){
		this.accx = this.accNaturalLimit;
	}else if (this.accx <0 && this.accx < -this.accNaturalLimit){
		this.accx = -this.accNaturalLimit;
	}
	
	if (this.accy >0 && this.accy > this.accNaturalLimit){
		this.accy = this.accNaturalLimit;
	}else if (this.accy <0 && this.accy < -this.accNaturalLimit){
		this.accy = -this.accNaturalLimit;
	}
	
	if (this.accangle>0 && this.accangle > this.accNaturalLimit){
		this.accangle = this.accNaturalLimit;
	}else if (this.accangle <0 && this.accangle < -this.accNaturalLimit){
		this.accangle = -this.accNaturalLimit;
	}
}

// FrictionA functions operate by looking at the acceleration of the object, reducing it to 0, but do not create oposite acc towards movement
// FrictionB functions operate by looking at the velocity of the object, giving oposite acceleration towards its current movement direction.

Sprite.prototype.frictionXB = function (dt){
	if(Math.abs(this.accx == 0 && Math.abs(this.velx) != 0)){
		if(this.accGravityX ==0){
			this.accCounterX = -(this.velx*3);		
			if(Math.abs(this.accCounterX)<0.001){
				this.accCounterX =0;
				this.velx=0;
			}
		}
	}else{
		this.accCounterX = 0;
	}
}

Sprite.prototype.frictionYB = function (dt){
	if(Math.abs(this.accy == 0 && Math.abs(this.vely) != 0)){
		if(this.accGravityY ==0){
			this.accCounterY = -(this.vely*3);		
			if(Math.abs(this.accCounterY)<0.001){
				this.accCounterY =0;
				this.vely=0;
			}
		}
	}else{
		this.accCounterY = 0;
	}
}

Sprite.prototype.frictionXA = function (dt){
	//if(this.accx !=0)
	//	console.log(this.accx);
	if(this.accx > 0){
		if(this.accx < this.stopVelX*dt){
			this.accx = 0;
		}else{
			this.accx -= this.stopVelX*dt;
		}
	}else if(this.accx < 0){
		if(this.accx > -this.stopVelX*dt){
			this.accx = 0;
		}else{
			this.accx += this.stopVelX*dt;
		}
	}
}

Sprite.prototype.frictionYA= function (dt){
	if(this.accy > 0){
		if(this.accy < this.stopVelY*dt){
			this.accy = 0;
		}else{
			this.accy -= this.stopVelY*dt;
		}
	}else if(this.accy < 0){
		if(this.accy > -this.stopVelY*dt){
			this.accy = 0;
		}else{
			this.accy += this.stopVelY*dt;
		}
	}	
}

Sprite.prototype.frictionAngleA= function(dt){	
	if(this.accangle > 0){
		if(this.accangle < this.stopVelX*dt){
			this.accangle = 0;
		}else{
			this.accangle -= this.stopVelX*dt;
		}
	}else if(this.accangle < 0){
		if(this.accangle > -this.stopVelX*dt){
			this.accangle = 0;
		}else{
			this.accangle += this.stopVelX*dt;
		}
	}
}

//FRICTION WORKS ON ANY MOVEMENT TYPE. HOWEVER, GRAVITY AND STANDARD ACCELERATION ARE DESIGN FOR CARTESIAN USAGE. USING ANGLES TO ROTATE THE SPRITE WILL REQUIRE YOU TO WRITE
//ACCELERATION APPART, AS WHEN USING POLAR COODINATES, YOU MUST USE ONLY 1 ACCELERATION (FOWARD), NOT 2 (X AND Y).
Sprite.prototype.move = function (dt){//COMPUTES THE ACCELERATION AND MOVES THE SHIP
	this.accLimiter();
	
	var cos = Math.cos(this.angle*Math.PI/180);
	var sine = Math.sin(this.angle*Math.PI/180);
	
	this.velx += this.accx*dt + this.accCounterX*dt + this.accGravityX*dt + this.accangle*cos*dt;
	this.vely += this.accy*dt + this.accCounterY*dt + this.accGravityY*dt + this.accangle*sine*dt;
	
	if(this.hasFrictionX){
		this.frictionXA(dt);
		this.frictionXB(dt);
	}
	if(this.hasFrictionY){
		this.frictionYA(dt);
		this.frictionYB(dt);
	}
	if(this.hasFrictionAngle){
		this.frictionAngleA(dt);
	}
	
	if(Math.abs(this.velx) > 0 && Math.abs(this.velx) > 0.001)
		this.x += this.velx;
	else
		this.velx =0;

	if(Math.abs(this.vely) > 0 && Math.abs(this.vely) > 0.001)	
		this.y += this.vely;	
	else
		this.vely =0;
	
};