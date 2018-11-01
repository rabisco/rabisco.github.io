const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Ws, "61cc61f4-c5a6-4d2b-afeb-2afeb42c3162", "1.0");

api.enabled = false;
client.connectToRegionMaster("SA");

api.draw_background_info("connection state: Offline");

client.onStateChange = function (state) {
	let status = "connection state: ";
	status += Photon.LoadBalancing.LoadBalancingClient.StateToName(state);
	api.draw_background_info(status);

	api.enabled = state == Photon.LoadBalancing.LoadBalancingClient.State.Joined

	if (client.isInLobby()) {
		client.joinRoom("my-custom-room", { createIfNotExists: true }, {});
	}
}

client.onJoinRoom = function () {
}
