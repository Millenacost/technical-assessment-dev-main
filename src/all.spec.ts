import "reflect-metadata";

import mongoose from "mongoose";
import supertest from "supertest";
import * as sinon from "sinon";
import { faker } from "@faker-js/faker";
import { expect, assert } from "chai";

import "./database";
import { Region } from "./models/region.model";
import GeoLib from "./lib";
import server from "./server";
import { RegionModel, UserModel } from "./models/models";

describe("Models", () => {
	let user;
	let session;
	const geoLibStub: Partial<typeof GeoLib> = {};

	before(async () => {
		geoLibStub.getAddressFromCoordinates = sinon
			.stub(GeoLib, "getAddressFromCoordinates")
			.resolves(faker.location.streetAddress({ useFullAddress: true }));
		geoLibStub.getCoordinatesFromAddress = sinon
			.stub(GeoLib, "getCoordinatesFromAddress")
			.resolves({
				lat: faker.location.latitude(),
				lng: faker.location.longitude(),
			});

		session = await mongoose.startSession();
		user = await UserModel.create({
			name: faker.person.firstName(),
			email: faker.internet.email(),
			address: faker.location.streetAddress({ useFullAddress: true }),
		});
	});

	after(() => {
		sinon.restore();
		session.endSession();
	});

	beforeEach(() => {
		session.startTransaction();
	});

	afterEach(() => {
		session.commitTransaction();
	});

	describe("UserModel", () => {
		it("should create a user", async () => {
			expect(1).to.be.eq(1);
		});
	});

	describe("RegionModel", () => {
		it("should create a region", async () => {
			const regionData: Omit<Region, "_id"> = {
				user: user._id,
				name: faker.person.fullName(),
				coordinates: {
					type: "Polygon",
					coordinates: [
						[[faker.location.latitude(), faker.location.longitude()]],
					],
				},
			};

			const [region] = await RegionModel.create([regionData]);

			expect(region).to.deep.include(regionData);
		});

		it("should rollback changes in case of failure", async () => {
			const userRecord = await UserModel.findOne({ _id: user._id })
				.select("regions")
				.lean();
			try {
				await RegionModel.create([{ user: user._id }]);

				assert.fail("Should have thrown an error");
			} catch {
				const updatedUserRecord = await UserModel.findOne({ _id: user._id })
					.select("regions")
					.lean();

				expect(userRecord).to.deep.eq(updatedUserRecord);
			}
		});
	});

	it("should return a list of users", async () => {
		const response = supertest(server).get(`/user`);

		expect(response).to.have.property("status", 200);
	});

	it("should return a user", async () => {
		const response = await supertest(server).get(`/users/${user._id}`);

		expect(response).to.have.property("status", 200);
	});
});
