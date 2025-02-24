import axios from "axios";
import { ICoordinates } from "./interfaces/coordinates.interface";
import "dotenv/config";

class GeoLib {
	private apiKey: string;

	constructor() {
		this.apiKey = process.env.OPENCAGE_API_KEY || "";
	}

	public async getAddressFromCoordinates(
		coordinates: ICoordinates
	): Promise<string> {
		const { lat, lng } = coordinates;
		const query = `${lat}+${lng}`;
		const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
			query
		)}&key=${this.apiKey}`;

		try {
			const response = await axios.get(url);
			const data = response?.data;

			if (data?.results?.length > 0) {
				return data.results[0].formatted;
			} else {
				throw new Error("No address found for the given coordinates");
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	public async getCoordinatesFromAddress(
		address: string
	): Promise<ICoordinates> {
		const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
			address
		)}&key=${this.apiKey}`;

		try {
			const response = await axios.get(url);
			const data = response.data;

			if (data?.results?.length > 0) {
				const location = data.results[0]?.geometry;
				return { lat: location.lat, lng: location.lng } as ICoordinates;
			} else {
				throw new Error("No coordinates found for the given address");
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export default new GeoLib();
