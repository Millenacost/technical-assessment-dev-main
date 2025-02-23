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

			//TODO -para utilizar os operadores do mongo db regiao tem que ter pelo menos 3 vertices, onde o ultimo tem que ser igual o primeiro
			//tem limite para lat e lgn tbm

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

	async getRegionsByPointByDistanceWithoutUser(req: Request, res: Response) {
		try {
			const { lat, lng, distance, user } = req.query;

			if (!lat || !lng || !distance) {
				return res.status(STATUS.BAD_REQUEST).json({
					message: "Latitude, longitude, distance and user are required",
				});
			}

			const query = {
				coordinates: {
					$geoWithin: {
						$centerSphere: [
							[parseFloat(lng as string), parseFloat(lat as string)],
							parseFloat(distance as string) / 6378.1,
						],
					},
				},
				user: { $ne: user },
			};

			if (user) {
				query.user = { $ne: user };
			}

			const regions = await RegionModel.find(query).lean();

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
