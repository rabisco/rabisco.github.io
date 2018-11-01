const undo_stack = [];
const current_undo_lines = {};
let current_undo_index = -1;

const undo_api = {
	request_undo: function (direction) {
		this.perform_undo(direction);
	},
	perform_undo: function (direction) {
		current_undo_index += direction;
		if (current_undo_index < -1) {
			current_undo_index = -1;
			return;
		}
		if (current_undo_index > undo_stack.length - 1) {
			current_undo_index = undo_stack.length - 1;
			return;
		}

		context.fillStyle = erase_style;
		context.fillRect(0, 0, canvas.width, canvas.height);

		for (i = 0; i <= current_undo_index; i++) {
			c = undo_stack[i];
			if (c.is_drawing) {
				for (l of c.lines) {
					api.draw(l.x0, l.y0, l.x1, l.y1);
				}
			} else {
				for (l of c.lines) {
					api.erase(l.x0, l.y0, l.x1, l.y1);
				}
			}
		}
	},
	add_undo_line: function (user_id, x0, y0, x1, y1) {
		let lines = current_undo_lines[user_id] || [];
		lines.push({ x0: x0, y0: y0, x1: x1, y1: y1 });
		current_undo_lines[user_id] = lines;
	},
	add_undo_command: function (user_id, is_drawing) {
		current_undo_index += 1;
		undo_stack.splice(current_undo_index);

		undo_stack.push({
			is_drawing: is_drawing,
			lines: current_undo_lines[user_id] || [],
		});

		current_undo_lines[user_id] = [];
	}
}
