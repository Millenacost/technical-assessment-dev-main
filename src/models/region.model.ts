import "reflect-metadata";

import * as mongoose from "mongoose";
import {
	pre,
	getModelForClass,
	Prop,
	Ref,
	modelOptions,
} from "@typegoose/typegoose";
import { User, UserModel } from "./user.model";
import { Base } from "./base.model";
import ObjectId = mongoose.Types.ObjectId;

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

export const RegionModel = getModelForClass(Region);
