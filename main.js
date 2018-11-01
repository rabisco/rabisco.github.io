const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const draw_style = "#888";
const draw_width = 3.0;

const erase_style = "#111";
const erase_width = 50.0;

const font_style = "#444";

var undo_buffer = null;

var prevX = 0.0;
var prevY = 0.0;
var currX = 0.0;
var currY = 0.0;

var is_pressing_mouse = false;
var is_drawing = false;
var is_first_action = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineJoin = "round";
context.lineCap = "round";
context.font = "30px Arial";
context.textAlign = "center";

canvas.addEventListener("mousemove", function (e) {
	prevX = currX;
	prevY = currY;
	currX = e.clientX - canvas.offsetLeft;
	currY = e.clientY - canvas.offsetTop;

	if (is_pressing_mouse) {
		if (is_drawing) {
			api.draw(prevX, prevY, currX, currY);
			api.on_draw(prevX, prevY, currX, currY);
		} else {
			api.erase(prevX, prevY, currX, currY);
			api.on_erase(prevX, prevY, currX, currY);
		}
	}
}, false);
canvas.addEventListener("mousedown", function (e) {
	is_pressing_mouse = true;
	undo_buffer = canvas.toDataURL();

	if (e.button == 0) {
		is_drawing = true;
	} else {
		is_drawing = false;
	}
}, false);
canvas.addEventListener("mouseup", function (e) {
	is_pressing_mouse = false;
}, false);
canvas.addEventListener("mouseout", function (e) {
	is_pressing_mouse = false;
}, false);

/*
document.onkeydown = function (e) {
	if (e.keyCode == 90 && e.ctrlKey) {
		var data = canvas.toDataURL();

		var undo_image = new Image();
		undo_image.src = undo_buffer;
		undo_image.onload = function () { context.drawImage(undo_image, 0, 0); }

		undo_buffer = data;
	}
};
*/

function trace_line(x0, y0, x1, y1) {
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.stroke();
	context.closePath();
}

function clear_screen_if_first_action() {
	if (is_first_action) {
		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);
		is_first_action = false;
	}
}

const api = {
	enabled: true,
	draw: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		clear_screen_if_first_action();

		context.lineWidth = draw_width;
		context.strokeStyle = draw_style;
		trace_line(x0, y0, x1, y1);
	},
	erase: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		clear_screen_if_first_action();

		context.lineWidth = erase_width;
		context.strokeStyle = erase_style;
		trace_line(x0, y0, x1, y1);
	},
	draw_background_info: function (extra_info) {
		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = font_style;
		context.fillText("left mouse button: sketch", canvas.width * 0.5, canvas.height * 0.5 - 60);
		context.fillText("other mouse buttons: eraser", canvas.width * 0.5, canvas.height * 0.5 - 20);
		context.fillText("f5: clear", canvas.width * 0.5, canvas.height * 0.5 + 20);
		//context.fillText("ctrl+z: undo once", canvas.width * 0.5, canvas.height * 0.5 + 60);

		context.fillText(extra_info, canvas.width * 0.5, canvas.height * 0.5 + 180);
	},
	on_draw: function (x0, y0, x1, y1) { },
	on_erase: function (x0, y0, x1, y1) { },
};

api.draw_background_info("");

window.onhashchange = function () {
	window.location.reload();
}