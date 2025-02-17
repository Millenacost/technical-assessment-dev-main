import "reflect-metadata";

import * as mongoose from "mongoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import {
	pre,
	getModelForClass,
	Prop,
	Ref,
	modelOptions,
} from "@typegoose/typegoose";
import lib from "./lib";

import ObjectId = mongoose.Types.ObjectId;

class Base extends TimeStamps {
	@Prop({ required: true, default: () => new ObjectId().toString() })
	_id: string;
}

@pre<User>("save", async function (next) {
	console.log("seila");
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

@pre<Region>("save", async function (next) {
	const region = this as mongoose.Document & Region;

	if (!region._id) {
		region._id = new ObjectId().toString();
	}

	if (region.isNew) {
		const user = await UserModel.findOne({ _id: region.user });
		user.regions.push(region._id);
		await user.save({ session: region.$session() });
	}

	next(region.validateSync());
})
@modelOptions({ schemaOptions: { validateBeforeSave: false } })
export class Region extends Base {
	declare _id: string;

	@Prop({ required: true })
	name!: string;

	@Prop({ ref: () => User, required: true, type: () => String })
	user: Ref<User>;
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
