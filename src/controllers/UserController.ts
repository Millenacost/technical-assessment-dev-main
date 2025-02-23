import { Request, Response } from "express";
import { STATUS } from "../constants/status.constants";
import { User } from "../models/user.model";
import { UserModel } from "../models/models";

class UserController {
	async getAll(req: Request, res: Response) {
		try {
			const { page, limit } = req.query as { page: string; limit: string };

			const [users, total]: [Array<User>, number] = await Promise.all([
				UserModel.find().lean(),
				UserModel.count(),
			]);

			return res.status(STATUS.OK).json({
				rows: users,
				page,
				limit,
				total,
			});
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const user = await UserModel.findOne({ _id: id }).lean();

			if (!user) {
				return res.status(STATUS.NOT_FOUND).json({ message: "User not found" });
			}

			return res.status(STATUS.OK).json(user);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async updateById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const userUpdate = req.body as User;

			if (!this.hasCoordinatesOrAddress(userUpdate)) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "You must provide coordinates or address" });
			}

			const user = await UserModel.findOne({ _id: id });

			if (!user) {
				return res.status(STATUS.NOT_FOUND).json({ message: "User not found" });
			}

			Object.keys(userUpdate).forEach((key) => {
				if (userUpdate[key] !== undefined) {
					user[key] = userUpdate[key];
				}
			});

			await user.save();

			return res.sendStatus(STATUS.UPDATED);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async create(req: Request, res: Response) {
		try {
			const user = new UserModel(req.body as User);

			if (!this.hasCoordinatesOrAddress(user)) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "You must provide coordinates or address" });
			}

			const userFound = await UserModel.findOne({ email: user.email });

			if (userFound) {
				return res
					.status(STATUS.BAD_REQUEST)
					.json({ message: "User already exists" });
			}
			await user.save();

			return res.status(STATUS.CREATED).json(user);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	async deleteById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const user = await UserModel.findOne({ _id: id });

			if (!user) {
				return res.status(STATUS.NOT_FOUND).json({ message: "User not found" });
			}

			await UserModel.deleteOne({ _id: id });

			return res.sendStatus(STATUS.OK);
		} catch (error) {
			return res
				.status(STATUS.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error", error });
		}
	}

	private hasCoordinatesOrAddress(user: User) {
		if (
			(user.coordinates && user.address) ||
			(!user.coordinates && !user.address)
		) {
			return false;
		}
		return true;
	}
}

export { UserController };
