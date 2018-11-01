const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Ws, "61cc61f4-c5a6-4d2b-afeb-2afeb42c3162", "1.0");

window.onload = function (e) {
	client.connectToRegionMaster("SA");
}