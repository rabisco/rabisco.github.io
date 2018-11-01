const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Wss, "61cc61f4-c5a6-4d2b-afeb-2afeb42c3162", "1.0");

const event_code_draw = 1;
const event_code_erase = 2;
const event_code_perform_undo = 3;
const event_code_add_undo_command = 4;

client.onStateChange = function (state) {
	let status = "connection state: ";
	status += Photon.LoadBalancing.LoadBalancingClient.StateToName(state);
	api.draw_background_info(status);

	api.enabled = state == Photon.LoadBalancing.LoadBalancingClient.State.Joined

	if (client.isInLobby()) {
		client.joinRoom(window.location.hash, { createIfNotExists: true }, {});
	}

	if (api.enabled) {
		api.local_user_id = client.myActor().actorNr;
	}
}

client.onEvent = function (code, data, actor_nr) {
	switch (code) {
		case event_code_draw:
			api.draw(data.x0, data.y0, data.x1, data.y1);
			break;
		case event_code_erase:
			api.erase(data.x0, data.y0, data.x1, data.y1);
			break;
		case event_code_perform_undo:
			undo_api.perform_undo(data);
			break;
		case event_code_add_undo_command:
			undo_api.perform_add_undo_command(data.command_type, data.lines);
			break;
		default:
			break;
	}
}

if (window.location.hash.length > 1) {
	api.enabled = false;
	api.draw_background_info("connection state: Offline");
	client.connectToRegionMaster("SA");

	api.on_draw = function (x0, y0, x1, y1) {
		client.raiseEvent(
			event_code_draw,
			{ x0: x0, y0: y0, x1: x1, y1: y1 },
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

	undo_api.on_request_add_undo_command = function (command_type, lines) {
		client.raiseEvent(
			event_code_add_undo_command,
			{ command_type: command_type, lines: lines },
			{ receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All, cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
		);
	}
}

