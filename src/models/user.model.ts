import { pre, Prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import lib from "../lib";
import { Region } from "./region.model";
import { Base } from "./base.model";
import { ICoordinates } from "../interfaces/coordinates.interface";

@pre<User>("save", async function (next) {
	const user = this as Omit<unknown, keyof User> & User & mongoose.Document;

	if (user.isNew) {
		if (
			(user.coordinates && user.address) ||
			(!user.coordinates && !user.address)
		) {
			return next(new Error("You must provide either coordinates or address"));
		}
	}

	if (user.isModified("coordinates")) {
		user.address = await lib.getAddressFromCoordinates(user.coordinates);
	} else if (user.isModified("address")) {
		const { lat, lng } = await lib.getCoordinatesFromAddress(user.address);

		user.coordinates = { lng, lat };
	}

	next();
})
export class User extends Base {
	declare _id: string;

	@Prop({ required: true })
	name!: string;

	@Prop({ required: true })
	email!: string;

	@Prop()
	address: string;

	@Prop({ type: () => Object })
	coordinates: ICoordinates;

	@Prop({ required: true, default: [], ref: () => Region, type: () => String })
	regions: Ref<Region>[];
}
