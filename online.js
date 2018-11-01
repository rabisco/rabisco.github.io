const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Wss, "61cc61f4-c5a6-4d2b-afeb-2afeb42c3162", "1.0");

const draw_event_code = 1;
const erase_event_code = 2;
const finish_event_code = 3;

if (window.location.hash.length > 1) {
	api.enabled = false;
	api.draw_background_info("connection state: Offline");
	client.connectToRegionMaster("SA");
}

client.onStateChange = function (state) {
	let status = "connection state: ";
	status += Photon.LoadBalancing.LoadBalancingClient.StateToName(state);
	api.draw_background_info(status);

	api.enabled = state == Photon.LoadBalancing.LoadBalancingClient.State.Joined

	if (client.isInLobby()) {
		client.joinRoom(window.location.hash, { createIfNotExists: true }, {});
	}
}

client.onEvent = function (code, data, actor_nr) {
	switch (code) {
		case draw_event_code:
			api.draw(data.x0, data.y0, data.x1, data.y1);
			break;
		case erase_event_code:
			api.erase(data.x0, data.y0, data.x1, data.y1);
			break;
		case finish_event_code:
			break;
		default:
			break;
	}
}

api.on_draw = function (x0, y0, x1, y1) {
	client.raiseEvent(
		draw_event_code,
		{ x0: x0, y0: y0, x1: x1, y1: y1 },
		{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
	);
}

api.on_erase = function (x0, y0, x1, y1) {
	client.raiseEvent(
		erase_event_code,
		{ x0: x0, y0: y0, x1: x1, y1: y1 },
		{ cache: Photon.LoadBalancing.Constants.EventCaching.AddToRoomCacheGlobal }
	);
}
