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
			const userData = {
				name: faker.person.firstName(),
				email: faker.internet.email(),
				address: faker.location.streetAddress({ useFullAddress: true }),
			};

			const response = await supertest(server).post(`/users`).send(userData);

			console.log(userData.name);
			console.log(JSON.stringify(response.body) + " response");
			expect(response).to.have.property("status", 201);
		});
	});

	describe("RegionModel", () => {
		xit("should create a region", async () => {
			const regionData: Omit<Region, "_id"> = {
				user: user._id,
				name: faker.person.fullName(),
				coordinates: {
					type: "Polygon",
					coordinates: [
						[
							[100, 90],
							[100, 90],
							[100, 90],
							[100, 90],
						],
					],
				},
			};
			const response = await supertest(server)
				.post(`/regions`)
				.send(regionData);
			console.log(regionData.name);
			console.log(JSON.stringify(response.body) + " response");
			expect(response.body.name).to.equal(regionData.name);
			expect(response).to.have.property("status", 201);
		});

		it("should rollback changes in case of failure", async () => {
			const userRecord = await UserModel.findOne({ _id: user._id })
				.select("regions")
				.lean();

			const stub = sinon
				.stub(RegionModel, "create")
				.throws(new Error("Simulated error"));

			try {
				await RegionModel.create([{ user: user._id }]);

				assert.fail("Should have thrown an error");
			} catch {
				const updatedUserRecord = await UserModel.findOne({ _id: user._id })
					.select("regions")
					.lean();

				expect(userRecord).to.deep.eq(updatedUserRecord);
			} finally {
				stub.restore();
			}
		});
	});

	it("should return a list of users", async () => {
		const response = await supertest(server).get(`/users`);

		expect(response).to.have.property("status", 200);
	});

	it("should return a user", async () => {
		const response = await supertest(server).get(`/users/${user._id}`);

		expect(response).to.have.property("status", 200);
	});
});
