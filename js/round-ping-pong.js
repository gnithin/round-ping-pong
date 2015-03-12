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

* Store racket info in ball, and use it in ball movement
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

function to_deg(rad){
	return (rad * (180/Math.PI));
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
	
	var bg_obj = new Background(
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
	var racket_obj =  new Racket(
				canvas_obj,
				x_ctr, y_ctr,
				racket_radius,
				racket_height,
				racket_width_deg,
				racket_pos_deg
			);

	//Ball declarations
	var ball_radius = 30;
	
	var boundary_obj = new Boundary(
		x_ctr, y_ctr,
		radius - ball_radius
	);
	
	var ball_offset_x = -30;
	var ball_offset_y = 30;

	var ball_obj = new Ball(
				canvas_obj,
				ball_radius,
				x_ctr + ball_offset_x , y_ctr + ball_offset_y,
				boundary_obj
			);

	//Initial Drawing
	bg_obj.draw();
	racket_obj.draw();
	ball_obj.draw();
	
	//Move things
	var animate_obj = new AnimationController (canvas_obj, bg_obj, racket_obj, ball_obj);
	animate_obj.animate();

	//Binding mouse click callbacks
	$(document).bind("click", function(){
		if( animate_obj.animation_ctrl == null){
			animate_obj.animate();
			toast("Play");
		}else{
			animate_obj.pause();
			toast("Pause");
		}
	});
}

function AnimationController(canvas_obj, bg_obj, racket_obj, ball_obj){
	this.canvas_obj = canvas_obj;
	this.ctx = canvas_obj.getContext("2d");
	this.bg_obj = bg_obj;
	this.racket_obj = racket_obj;
	this.ball_obj = ball_obj;
	this.animation_ctrl = null;
}

AnimationController.prototype.animate = function(){
	this.animation_ctrl = window.requestAnimationFrame(this.run.bind(this));
}

AnimationController.prototype.run = function(timestamp){	
	//Cleaning the canvas
	this.ctx.clearRect(
		0, 0,
		this.canvas_obj.width,
		this.canvas_obj.height
	);
	
	//Updating the position of the Racket.
	//TODO: Make it event driven.
	cur_pos = this.racket_obj.pos_deg;
	new_pos = (cur_pos + 0.5) % 360;
	//this.racket_obj.draw(new_pos);
	
	//Updating the position of the Ball.
	this.ball_obj.move();
	this.ball_obj.draw();
	
	//Draw new background
	this.bg_obj.draw();
	this.animation_ctrl = window.requestAnimationFrame(this.run.bind(this));
}

AnimationController.prototype.pause = function(){
	//log(this.animation_ctrl);
	window.cancelAnimationFrame(this.animation_ctrl);
	this.animation_ctrl = null;
}

function Ball(canvas_obj, radius, x_ctr, y_ctr, boundary_obj){
	this.canvas_obj = canvas_obj;
	this.ctx = canvas_obj.getContext("2d");
	this.x_ctr = (typeof x_ctr === "undefined")? 0 : x_ctr;
	this.y_ctr = (typeof y_ctr === "undefined")? 0 : y_ctr;
	this.radius = radius;
	this.boundary_obj = boundary_obj;

	//x & y increments
	this.x_inc = 1;
	this.y_inc = 1;
	this.deg = 90;
	this.bg_radius = boundary_obj.radius + this.radius
}

Ball.prototype.draw = function(x_ctr, y_ctr){
	if(typeof x_ctr !== "undefined"){
		this.x_ctr = x_ctr;
	}
	if(typeof y_ctr !== "undefined"){
		this.y_ctr = y_ctr;
	}
	this.ctx.beginPath();
	this.ctx.arc(
		this.x_ctr, this.y_ctr,
		this.radius,
		0, Math.PI * 360
	);
	this.ctx.stroke();
}

Ball.prototype.move = function(){
	//Equation is used boundary circle.
	/*
	TODO:
	Have to consider the angle to rebound.
	*/
	var ball_x = this.x_ctr;
	var ball_y = this.y_ctr;
	var bound_x = this.boundary_obj.x_ctr;
	var bound_y = this.boundary_obj.y_ctr;

	var bound_radius = this.boundary_obj.radius;

	LHS = Math.pow((ball_x - bound_x), 2) + Math.pow((ball_y - bound_y), 2);
	RHS = Math.pow(bound_radius, 2);

	if( LHS >= RHS ){
		x_diff = bound_x - ball_x;
		y_diff = bound_y - ball_y;
		
		slope_bg = (bound_y - ball_y)/(bound_x - ball_x);

		//Converting the slope to degrees
		bg_slope_deg = to_deg(Math.atan(slope_bg));

		//atan returns -90 to 90. Fixing that to 0 to 180.
		if(bg_slope_deg < 0){
			bg_slope_deg += 180;
		}

		//fixing deg to 0 - 360
		if(y_diff > 0){
			//ball is on top half.
			//Top half angle is always 180+
			bg_slope_deg += 180;

			//Calculating difference
			slope_diff = bg_slope_deg - this.deg;
			
			if(slope_diff > 0){
				if(x_diff > 0){
					this.deg -= 2 * slope_diff;
				}else{
					this.deg += 2 * slope_diff;
				}
			}else{
				if(x_diff > 0){
					this.deg += 2 * slope_diff;
				}else{
					this.deg -= 2 * slope_diff;
				}
			}

			//Top haf angle reversal correction.
			this.deg = this.deg - 180;
		}else{
			//ball is in the bottom half.
			
			//TODO: Verify bottom half. First half is fine.
			//log("Bottom half");
			slope_diff = bg_slope_deg - this.deg;
			
			/*
			log("Ball slope angle " + this.deg);
			log("bg slope angle " + bg_slope_deg);
			*/

			if(slope_diff < 0){
				if(x_diff < 0){
					this.deg -= 2 * slope_diff;
				}else{
					this.deg += 2 * slope_diff;
				}
			}else{
				if(x_diff < 0){
					this.deg += 2 * slope_diff;
				}else{
					this.deg -= 2 * slope_diff;
				}
			}
			//log("Result " + this.deg);
			
			//Bottom half angle reversal correction.
			this.deg = 180 + this.deg;
		}
		
	}
	//Increment condition
	this.x_ctr +=  Math.cos(to_rad(this.deg));
	this.y_ctr +=  Math.sin(to_rad(this.deg));
	
}

function Background(canvas_obj, x_ctr, y_ctr, radius){
	this.canvas_obj = canvas_obj;
	this.ctx = canvas_obj.getContext("2d");	
	this.x_ctr = x_ctr;
	this.y_ctr = y_ctr;
	this.radius = radius;
}

Background.prototype.draw = function(){
	this.ctx.beginPath();
	this.ctx.arc(
		this.x_ctr,this.y_ctr,
		this.radius,
		0, to_rad(360)
	);
	this.ctx.stroke();
}

function Racket(canvas_obj, x_ctr, y_ctr, radius, height, width_deg, pos_deg){
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
Racket.prototype.draw = function(pos, width){
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

Racket.prototype.draw_arc = function (x,y,radius,start_angle, end_angle){
	this.ctx.beginPath();
	this.ctx.arc(
		x,y,
		radius,
		start_angle,end_angle,
		true
	);
	this.ctx.stroke();
}

Racket.prototype.draw_arc_line = function(angle){
	this.ctx.beginPath();
	x_src = this.radius * Math.cos(to_rad(angle)) + this.x_ctr;
	y_src = this.radius * Math.sin(to_rad(angle)) + this.y_ctr;

	x_dest = (this.radius+this.height) * Math.cos(to_rad(angle)) + this.x_ctr;
	y_dest = (this.radius+this.height) * Math.sin(to_rad(angle)) + this.y_ctr;

	this.ctx.moveTo(x_src, y_src);
	this.ctx.lineTo(x_dest, y_dest);

	this.ctx.stroke();
}

function Boundary(x_ctr, y_ctr, radius){
	this.x_ctr = x_ctr;
	this.y_ctr = y_ctr;
	this.radius = radius;
}
