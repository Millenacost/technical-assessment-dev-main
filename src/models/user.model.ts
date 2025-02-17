import { getModelForClass, pre, Prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import lib from "../lib";
import { Region } from "./region.model";
import { Base } from "./base.model";

@pre<User>("save", async function (next) {
	const user = this as Omit<unknown, keyof User> & User & mongoose.Document;

	if (user.isModified("coordinates")) {
		user.address = await lib.getAddressFromCoordinates(user.coordinates);
	} else if (user.isModified("address")) {
		const { lat, lng } = await lib.getCoordinatesFromAddress(user.address);

		user.coordinates = [lng, lat];
	}

	if (user.isNew) {
		if (
			(user.coordinates && user.address) ||
			(!user.coordinates && !user.address)
		) {
			console.error("You must provide either coordinates or address");
		}
	}

	next();
})
export class User extends Base {
	declare _id: string;

	@Prop({ required: true })
	name!: string;

	@Prop({ required: true })
	email!: string;

	@Prop({ required: true })
	address: string;

	@Prop({ required: true, type: () => [Number] })
	coordinates: [number, number];

	@Prop({ required: true, default: [], ref: () => Region, type: () => String })
	regions: Ref<Region>[];
}

export const UserModel = getModelForClass(User);
