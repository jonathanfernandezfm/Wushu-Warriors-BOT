const axios = require("axios").default;
const https = require("https");
var cache = require("memory-cache");
const { get } = require("mongoose");

const BNET_URL = "https://eu.battle.net";
const NAMESPACE = "profile-eu";

class WoWApi {
	constructor(client, client_secret, region, realm, locale) {
		this.client = client;
		this.client_secret = client_secret;
		this.region = region;
		this.realm = realm;
		this.locale = locale;
		this.api_url = `https://${this.region}.api.blizzard.com`;
	}

	login() {
		this.getAccessToken();
	}

	getAccessToken() {
		return new Promise((resolve, reject) => {
			this.refreshToken()
				.then((res) => {
					cache.put("accessToken", res.data.access_token);
					resolve(res.data.access_token);
				})
				.catch((err) => {
					console.log(err);
					reject(err);
				});
		});
	}

	refreshToken() {
		const options = {
			auth: {
				username: this.client,
				password: this.client_secret,
			},
			params: {
				grant_type: "client_credentials",
			},
		};

		return axios.post(BNET_URL + "/oauth/token", null, options);
	}

	getGuildRoster(guild) {
		let accessToken = cache.get("accessToken");

		if (accessToken)
			return this.getAccessToken()
				.then((accessToken) => {
					const options = {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
						params: {
							namespace: NAMESPACE,
						},
					};

					return axios.get(
						`${this.api_url}/data/wow/guild/${this.realm}/${guild}/roster`,
						options
					);
				})
				.catch((err) => {
					console.log(err);
				});
	}
}

module.exports = WoWApi;
