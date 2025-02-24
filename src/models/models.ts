import { getModelForClass } from "@typegoose/typegoose";
import { User } from "./user.model";
import { Region } from "./region.model";

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
