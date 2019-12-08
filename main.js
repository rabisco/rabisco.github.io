const version = "0.3";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const draw_style = "#888";
const draw_width = 3.0;

const erase_style = "#111";
const erase_width = 80.0;

const font_style = "#444";

let prev_x = 0.0;
let prev_y = 0.0;
let curr_x = 0.0;
let curr_y = 0.0;

let canvas_state_before_write = new Image();
let text_x = 0.0;
let text_y = 0.0;
let current_text = "";

let is_pressing_mouse = false;
let is_drawing = false;
let is_first_action = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineJoin = "round";
context.lineCap = "round";
context.font = "30px Arial";
context.textAlign = "center";

canvas.addEventListener("mousemove", function (e) {
	prev_x = curr_x;
	prev_y = curr_y;
	curr_x = e.clientX - canvas.offsetLeft;
	curr_y = e.clientY - canvas.offsetTop;

	if (is_pressing_mouse) {
		if (is_drawing) {
			api.draw(prev_x, prev_y, curr_x, curr_y);
			api.on_draw(prev_x, prev_y, curr_x, curr_y);
		} else {
			api.erase(prev_x, prev_y, curr_x, curr_y);
			api.on_erase(prev_x, prev_y, curr_x, curr_y);
		}

		undo_api.add_local_undo_line(prev_x, prev_y, curr_x, curr_y);
	}
}, false);
canvas.addEventListener("mousedown", function (e) {
	end_write();
	is_pressing_mouse = true;

	if (e.button == 0) {
		is_drawing = true;
	} else {
		is_drawing = false;
	}
}, false);
canvas.addEventListener("mouseup", function (e) {
	is_pressing_mouse = false;
	undo_api.request_add_undo_command(is_drawing ? command_type_draw : command_type_erase);
	text_x = e.clientX;
	text_y = e.clientY;
}, false);
canvas.addEventListener("mouseout", function (e) {
	if (is_pressing_mouse)
		undo_api.request_add_undo_command(is_drawing ? command_type_draw : command_type_erase);
	is_pressing_mouse = false;
}, false);

document.onkeydown = function (e) {
	// Z
	if (e.keyCode == 90 && e.ctrlKey) {
		end_write();
		if (e.shiftKey) {
			undo_api.request_undo(1);
		} else {
			undo_api.request_undo(-1);
		}
	}
	// ESC
	else if (e.keyCode == 27) {
		end_write();
		api.clear();
		api.on_clear();
		undo_api.request_add_undo_command(command_type_clear);
	}
	// Backspace
	else if (e.keyCode == 8) {
		before_write();
		current_text = current_text.slice(0, -1);

		api.write(text_x, text_y, current_text);
		api.on_write(text_x, text_y, current_text);
		undo_api.set_local_undo_text(text_x, text_y, current_text);
	}
	// Enter
	else if (e.keyCode == 13) {
		end_write();
	}
	// Skip
	else if (
		e.keyCode == 37 || // Left
		e.keyCode == 38 || // Up
		e.keyCode == 39 || // Right
		e.keyCode == 40 || // Down
		e.keyCode == 46 || // Delete
		e.keyCode == 0
	) {
	}
	// Write
	else if (!e.ctrlKey && !e.altKey && !e.metaKey) {
		before_write();
		current_text += e.key;

		api.write(text_x, text_y, current_text);
		undo_api.set_local_undo_text(text_x, text_y, current_text);
	}
};

function before_write() {
	if (is_first_action) {
		api.clear();
	}

	if (current_text === "") {
		canvas_state_before_write.src = canvas.toDataURL();
	} else {
		context.drawImage(canvas_state_before_write, 0, 0);
	}
}

function end_write() {
	if (current_text === "") {
		return;
	}

	api.on_write(text_x, text_y, current_text);
	undo_api.request_add_undo_command(command_type_write);
	current_text = "";
}

function trace_line(x0, y0, x1, y1) {
	context.beginPath();
	context.moveTo(x0, y0);
	context.lineTo(x1, y1);
	context.stroke();
	context.closePath();
}

const api = {
	enabled: true,
	clear: function () {
		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);
	},
	draw: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		if (is_first_action) {
			this.clear();
			is_first_action = false;
		}

		context.lineWidth = draw_width;
		context.strokeStyle = draw_style;
		trace_line(x0, y0, x1, y1);
	},
	write: function (x, y, text) {
		if (!this.enabled) {
			return;
		}

		if (is_first_action) {
			this.clear();
			is_first_action = false;
		}

		context.textAlign = "center";
		context.fillStyle = font_style;
		context.fillText(text, x, y);
	},
	erase: function (x0, y0, x1, y1) {
		if (!this.enabled) {
			return;
		}

		context.lineWidth = erase_width;
		context.strokeStyle = erase_style;
		trace_line(x0, y0, x1, y1);
	},
	on_clear: function () { },
	on_draw: function (_x0, _y0, _x1, _y1) { },
	on_write: function (_x, _y, _text) { },
	on_erase: function (_x0, _y0, _x1, _y1) { },
	draw_background_info: function (extra_info) {
		this.clear();

		context.textAlign = "center";
		context.fillStyle = font_style;
		context.fillText("left mouse button: sketch", canvas.width * 0.5, canvas.height * 0.5 - 100);
		context.fillText("other mouse buttons: eraser", canvas.width * 0.5, canvas.height * 0.5 - 60);
		context.fillText("esc: clear", canvas.width * 0.5, canvas.height * 0.5 - 20);
		context.fillText("ctrl+z: undo", canvas.width * 0.5, canvas.height * 0.5 + 20);
		context.fillText("ctrl+shift+z: redo", canvas.width * 0.5, canvas.height * 0.5 + 60);
		context.fillText(window.location.hostname + "/roomname: collaborate online", canvas.width * 0.5, canvas.height * 0.5 + 100);

		context.fillText(extra_info, canvas.width * 0.5, canvas.height - 100);

		context.fillText(version, canvas.width - 40, canvas.height - 40);
	}
};

api.draw_background_info("");
