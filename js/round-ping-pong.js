/*
	 TODOs and Ideas
	 ===============
* Use multiple canvas elements.
  One for backgroud and other for moving parts.
  That will make repainting job a lot easier.

* Control Speed
  Need to use a separate logic inside requestAnimation to 
  consider exact time.
 
* Add User control
  Add move left and move right after setting boundaries for the rackets.

* Create ball
*/

/*
	Globals
	-------
*/
var canvas_obj;
var animation_ctrl;

/*
	Utility functions
	-----------------
*/
function to_rad(deg){
	return (deg * (Math.PI/180));
}

function log(str){
	console.log(str);
}

/*
	Main code
*/
$(document).ready(main);
function main(){
	//Assigning globals
	canvas_obj = document.getElementById("canvas");

	//If the canvas object is not supported.
	if(!canvas_obj.getContext){
		//Return some error message here.
		return;
	}
	
	/*
		Setting up objects of background and racket.
	*/
	//Setting the size of the canvas
	canvas_obj.width = window.innerWidth;
	canvas_obj.height = window.innerHeight;

	x_ctr = canvas_obj.width/2;
	y_ctr = canvas_obj.height/2;
	radius = x_ctr/2;
	
	var bg_obj = new background(
				canvas_obj,
				x_ctr, y_ctr,
				radius
			);

	var racket_height = 30;
	//offset is used to maintaining distance between the bg and the racket
	var offset = 5;
	var racket_radius = radius - racket_height - offset;
	var racket_width_deg = 30;
	var racket_pos_deg = 180;
	var racket_obj =  new racket(
				canvas_obj,
				x_ctr, y_ctr,
				racket_radius,
				racket_height,
				racket_width_deg,
				racket_pos_deg
			);
	
	//Initial Drawing
	bg_obj.draw();
	racket_obj.draw();
	
	//Move things
	animate(canvas_obj, bg_obj, racket_obj);
}

function animate(canvas_obj, bg_obj, racket_obj){
	function run(timestamp){
		racket_obj.ctx.clearRect(0,0, racket_obj.canvas_obj.width, racket_obj.canvas_obj.height);
		cur_pos = racket_obj.pos_deg;
		new_pos = (cur_pos + 0.5) % 360;
		racket_obj.draw(new_pos);
		bg_obj.draw();
		window.requestAnimationFrame(run);
	}
	animation_ctrl = window.requestAnimationFrame(run);
}

function background(canvas_obj, x_ctr, y_ctr, radius){
	this.canvas_obj = canvas_obj;
	this.ctx = canvas_obj.getContext("2d");
	this.x_ctr = x_ctr;
	this.y_ctr = y_ctr;
	this.radius = radius;
}

background.prototype.draw = function(){
	this.ctx.beginPath();
	this.ctx.arc(
		this.x_ctr,this.y_ctr,
		this.radius,
		0, to_rad(360)
	);
	this.ctx.stroke();
}

function racket(canvas_obj, x_ctr, y_ctr, radius, height, width_deg, pos_deg){
	this.canvas_obj = canvas_obj;
	this.ctx = canvas_obj.getContext("2d");
	this.x_ctr = x_ctr;
	this.y_ctr = y_ctr;
	this.radius = radius;
	this.height = height;
	this.width_deg = width_deg;
	this.pos_deg = pos_deg;
}

//width and pos in degrees
racket.prototype.draw = function(pos, width){
	/*
	IMP INFO
	--------
	This angles of the arc(irrespective of the direction)
		270
	180		0
		90
	*/
	//setting default parameters.
	if(typeof width === 'undefined'){
		width = this.width_deg;
	}else{
		this.width_deg = width;
	}
	if(typeof pos === 'undefined'){
		pos = this.pos_deg;
	}else{
		this.pos_deg = pos;
	}
	
	var start_angle = to_rad(pos);
	var end_angle = start_angle - to_rad(width);
	this.draw_arc(
		this.x_ctr, this.y_ctr,
		this.radius,
		start_angle, end_angle
	);
	this.draw_arc(
		this.x_ctr,this.y_ctr,
		this.radius + this.height,
		start_angle,end_angle	
	);
	this.draw_arc_line(pos);
	this.draw_arc_line(pos-width);
}

racket.prototype.draw_arc = function (x,y,radius,start_angle, end_angle){
	this.ctx.beginPath();
	this.ctx.arc(
		x,y,
		radius,
		start_angle,end_angle,
		true
	);
	this.ctx.stroke();
}

racket.prototype.draw_arc_line = function(angle){
	this.ctx.beginPath();
	x_src = this.radius * Math.cos(to_rad(angle)) + this.x_ctr;
	y_src = this.radius * Math.sin(to_rad(angle)) + this.y_ctr;

	x_dest = (this.radius+this.height) * Math.cos(to_rad(angle)) + this.x_ctr;
	y_dest = (this.radius+this.height) * Math.sin(to_rad(angle)) + this.y_ctr;

	this.ctx.moveTo(x_src, y_src);
	this.ctx.lineTo(x_dest, y_dest);

	this.ctx.stroke();
}
