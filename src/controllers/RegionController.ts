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

	async create(req: Request, res: Response) {
		try {
			const region = new RegionModel(req.body);

			const regionFound = await RegionModel.findOne({ name: region.name });

			if (regionFound) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "Region already exists" });
			}

			if (region.coordinates.coordinates[0].length < 4) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "Region must have at least 3 vertices" });
			}

			if (
				region.coordinates.coordinates[0][0][0] !==
					region.coordinates.coordinates[0][
						region.coordinates.coordinates[0].length - 1
					][0] ||
				region.coordinates.coordinates[0][0][1] !==
					region.coordinates.coordinates[0][
						region.coordinates.coordinates[0].length - 1
					][1]
			) {
				return res.status(STATUS.BAD_REQUEST).json({
					message: "Region must have the first and last vertices equal",
				});
			}

			for (const vertex of region.coordinates.coordinates[0]) {
				const [lng, lat] = vertex;
				if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
					return res.status(STATUS.BAD_REQUEST).json({
						message:
							"Latitude must be between -90 and 90, and longitude must be between -180 and 180",
					});
				}
			}

			await region.save();

			return res.status(STATUS.CREATED).json(region);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async updateById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const regionUpdate = req.body;

			const region = await RegionModel.findOne({ _id: id });

			if (!region) {
				return res
					.status(STATUS.NOT_FOUND)
					.json({ message: "Region not found" });
			}

			Object.keys(regionUpdate).forEach((key) => {
				if (regionUpdate[key] !== undefined) {
					region[key] = regionUpdate[key];
				}
			});

			await region.save();

			return res.sendStatus(STATUS.UPDATED);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async deleteById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const region = await RegionModel.findOne({ _id: id }).lean();

			if (!region) {
				return res
					.status(STATUS.NOT_FOUND)
					.json({ message: "Region not found" });
			}

			await RegionModel.deleteOne({ _id: id });

			return res.status(STATUS.OK).json({ message: "Region deleted" });
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}
}

export { RegionController };
