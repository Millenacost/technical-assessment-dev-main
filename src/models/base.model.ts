import mongoose from "mongoose";
import ObjectId = mongoose.Types.ObjectId;
import { Prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export class Base extends TimeStamps {
	@Prop({ required: true, default: () => new ObjectId().toString() })
	_id: string;
}
