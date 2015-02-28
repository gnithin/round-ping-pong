$(document).ready(init);
/*
	Globals
	-------
*/
var canvas_obj;

function log(str){
	console.log(str);
}

function init(){
	//Assigning globals
	canvas_obj = document.getElementById("canvas");
	if(!canvas_obj.getContext){
		//Canvas object is not supported.
		return;
	}

	//Setting the size of the canvas
	set_canvas_size(canvas_obj);
	draw(canvas_obj);
}

//function set_canvas_size(){
function set_canvas_size(canvas_obj){
	canvas_obj.width = window.innerWidth;
	canvas_obj.height = window.innerHeight;
}

//function draw(){
function draw(canvas_obj){
	var ctx = canvas_obj.getContext("2d");
	/*
		TODO:
		Draw  circular shape here.
		Make rackets
	*/
}

