import mongoose from "mongoose";
import "dotenv/config";

const env = {
	MONGO_URI: process.env.MONGO_URI || "",
};

const init = async function () {
	try {
		await mongoose.connect(env.MONGO_URI);
		console.log("Mongodb connected");
	} catch (error) {
		console.error("Error connecting to mongodb", error);
		process.exit(1);
	}
};

export default init;
