var eCanvas;
var ctx;
var dateActual;
var dateBefore;
var fps;
var deltaTime;
var oldCanvasW;
var oldCanvasH;
var keyMap;
var mouseX=0;
var mouseY=0;
//var KeyPressedFunctions;
var mouseClick = false;
var lastClickEvent;
var toExecuteClickEvents;
var keyFunctions;
var objects;
var loopFunctions;
var mouseFunctions;
var DEBUG = false;

function setKeyFunction(keyCod,keyEven,func,functionPara){
	var action = new keyFunction(keyCod,keyEven,func,functionPara);
	keyFunctions.push(action);
}
function setLoopFunction(func,functionPara){
	var action = new loopFunction(func,functionPara);
	loopFunctions.push(action);
}
function setMouseFunction(even,but,func,functionPara){
	var action = new mouseFunction(even,but,func,functionPara);
	mouseFunctions.push(action);
}
function loopFunction(func,functionPara){
	this.funct = func;
	this.functionParameters = functionPara;
}
function keyFunction(keyCod,keyEven,func,functionPara){
	this.funct = func;
	this.functionParameters = functionPara;
	this.keyEvent = keyEven;
	this.keyCode = keyCod;
}
function mouseFunction(even,but,func,functionPara){
	this.funct = func;
	this.functionParameters = functionPara;
	this.event = even;
	this.button = but;
}
function setCanvasSize(canvas){
	var h = window.innerHeight;
	var w = window.innerWidth;
	if(h<w){
		w=h;
	}else{
		h=w
	}
	canvas.width = w*0.9;
	canvas.height = h*0.9;
}
function setupGame(canvas){
	eCanvas = canvas;
	eCanvas.onmousemove=function(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	};
	ctx = eCanvas.getContext("2d");	
	setCanvasSize(ctx);
	dateActual = new Date();
	dateBefore = new Date();
	fps = 60;
	deltaTime = 1/fps;
	oldCanvasW = eCanvas.width-1;
	oldCanvasH = eCanvas.height-1;
	keyMap = {};
	keyFunctions = new Array();
	mouseFunctions = new Array();
	objects = new Array();
	loopFunctions = new Array();
	onkeydown = onkeyup = function(e){
		keyMap[e.keyCode] = e.type;//'keydown' & 'keyup'
	}
	eCanvas.addEventListener("click",clickUpdate,false);
	toExecuteClickEvents = new Array();
	DEBUG = false;
	mouseClick = false;
}
function clickUpdate(e){
	mouseClick = true;
	lastClickEvent = e;
	toExecuteClickEvents.push(e);
	return false;
}
function mainLoop(){
	requestAnimationFrame(mainLoop);
	dateBefore = dateActual;
	dateActual = new Date();
	deltaTime = (dateActual - dateBefore)/1000;
	setCanvasSize(eCanvas);
	executeKeyActions();
	executeMouseActions();
	for(var i =0;i<objects.length;i++){
		if(typeof objects[i].move === "function")
			objects[i].move(deltaTime);
	}
	for(var i =0;i<loopFunctions.length;i++){
		loopFunctions[i].funct(loopFunctions[i].functionParameters);
	}	
	draw();
}
function draw(){	
	cleanCanvas(ctx);	
	drawBoundryBox(ctx);
	for(var i =0;i<objects.length;i++){
		if(typeof objects[i].draw === "function")
			objects[i].draw(ctx);
	}
	if(DEBUG){
		var DEBUGx = 200;
		var DEBUGy = 20;
		ctx.font="20px Arial";
		ctx.fillStyle = "PURPLE";
		ctx.fillText("DT: "+deltaTime.toFixed(3)+" ms",DEBUGx,DEBUGy);
		ctx.fillText("FPS: "+(1/deltaTime).toFixed(0),DEBUGx,20+DEBUGy);
		ctx.fillText("MouseX: "+mouseX,DEBUGx,40+DEBUGy);
		ctx.fillText("MouseY: "+mouseY,DEBUGx,60+DEBUGy);			
	}
}
function drawBoundryBox(canvas){		
	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";	
	ctx.strokeRect(0,0,canvas.width-1,canvas.height-1);
}

function cleanCanvas(canvas){
	ctx.clearRect(0,0,canvas.width,canvas.height)
}
function executeMouseActions(){
	for(var i =0;i<mouseFunctions.length;i++){
		// console.log(mouseFunctions[i]);
		for(var j=0;j<toExecuteClickEvents.length;j++){
			if(mouseFunctions[i].button == toExecuteClickEvents[j].buttons){
				mouseFunctions[i].funct(mouseFunctions[i].functionParameters);
			}
		}
	}
	toExecuteClickEvents = new Array();
}
function executeKeyActions(){
	for(var i =0;i<keyFunctions.length;i++){
		if(keyFunctions[i].keyCode in keyMap && keyMap[keyFunctions[i].keyCode] == keyFunctions[i].keyEvent){
			keyFunctions[i].funct(keyFunctions[i].functionParameters);
		}
	}
}