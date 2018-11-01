const command_type_clear = 0;
const command_type_draw = 1;
const command_type_erase = 2;

const undo_stack = [];
let current_undo_index = -1;
let local_undo_lines = [];

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

		api.clear();

		for (i = 0; i <= current_undo_index; i++) {
			c = undo_stack[i];
			switch (c.command_type) {
				case command_type_clear:
					api.clear();
					break;
				case command_type_draw:
					for (l of c.lines) {
						api.draw(l.x0, l.y0, l.x1, l.y1);
					}
					break;
				case command_type_erase:
					for (l of c.lines) {
						api.erase(l.x0, l.y0, l.x1, l.y1);
					}
					break;
				default:
					break;
			}
		}
	},
	add_local_undo_line: function (x0, y0, x1, y1) {
		local_undo_lines.push({ x0: x0, y0: y0, x1: x1, y1: y1 });
	},
	request_add_undo_command: function (command_type) {
		this.on_request_add_undo_command(command_type, local_undo_lines);
		local_undo_lines = [];
	},
	on_request_add_undo_command: function (command_type, lines) {
		this.perform_add_undo_command(command_type, lines);
	},
	perform_add_undo_command: function (command_type, lines) {
		current_undo_index += 1;
		undo_stack.splice(current_undo_index);
		undo_stack.push({
			command_type: command_type,
			lines: lines,
		});
	}
}
