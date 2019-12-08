const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Wss, "61cc61f4-c5a6-4d2b-afeb-2afeb42c3162", version);

const event_code_clear = 1;
const event_code_draw = 2;
const event_code_write = 3;
const event_code_erase = 4;
const event_code_perform_undo = 5;
const event_code_add_undo_command = 6;

client.onStateChange = function (state) {
	let status = "connection state: ";
	status += Photon.LoadBalancing.LoadBalancingClient.StateToName(state);
	api.draw_background_info(status);

	api.enabled = state == Photon.LoadBalancing.LoadBalancingClient.State.Joined

	if (client.isInLobby()) {
		client.joinRoom(window.location.pathname, { createIfNotExists: true }, {});
	}

	if (api.enabled) {
		api.local_user_id = client.myActor().actorNr;
	}
}

client.onEvent = function (code, data, _actor_nr) {
	switch (code) {
		case event_code_clear:
			api.clear();
			break;
		case event_code_draw:
			api.draw(data.x0, data.y0, data.x1, data.y1);
			break;
		case event_code_write:
			api.write(data.x, data.y, data.text);
			break;
		case event_code_erase:
			api.erase(data.x0, data.y0, data.x1, data.y1);
			break;
		case event_code_perform_undo:
			undo_api.perform_undo(data);
			break;
		case event_code_add_undo_command:
			undo_api.perform_add_undo_command(data.command_type, data.lines, data.text);
			break;
		default:
			break;
	}
}

function online_init() {
	api.enabled = false;
	api.draw_background_info("connection state: Offline");
	client.connectToRegionMaster("SA");

	api.on_clear = function () {
		client.raiseEvent(
			event_code_clear,
			null,
			{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		)
	};

	api.on_draw = function (x0, y0, x1, y1) {
		client.raiseEvent(
			event_code_draw,
			{ x0: x0, y0: y0, x1: x1, y1: y1 },
			{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}

	api.on_write = function (x, y, text) {
		client.raiseEvent(
			event_code_write,
			{ x: x, y: y, text: text },
			{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}

	api.on_erase = function (x0, y0, x1, y1) {
		client.raiseEvent(
			event_code_erase,
			{ x0: x0, y0: y0, x1: x1, y1: y1 },
			{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}

	undo_api.request_undo = function (direction) {
		client.raiseEvent(
			event_code_perform_undo,
			direction,
			{ receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All, cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}

	undo_api.on_request_add_undo_command = function (command_type, lines, text) {
		client.raiseEvent(
			event_code_add_undo_command,
			{ command_type: command_type, lines: lines, text: text },
			{ receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All, cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}
}

window.onload = function () {
	init();
	online_init();
}