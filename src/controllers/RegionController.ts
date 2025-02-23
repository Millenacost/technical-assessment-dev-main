import { Request, Response } from "express";
import { STATUS } from "../constants/status.constants";
import { RegionModel } from "../models/models";

class RegionController {
	async getRegionsByPoint(req: Request, res: Response) {
		try {
			const { lat, lng } = req.query;

			if (!lat || !lng) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "Latitude and longitude are required" });
			}

			const point = {
				coordinates: [parseFloat(lat as string), parseFloat(lng as string)],
				type: "Point",
			};

			const regions = await RegionModel.find({
				coordinates: {
					$geoIntersects: {
						$geometry: point,
					},
				},
			}).lean();

			if (regions.length === 0) {
				return res
					.status(STATUS.NOT_FOUND)
					.json({ message: "No regions found" });
			}
			return res.status(STATUS.OK).json(regions);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}
}

export { RegionController };
