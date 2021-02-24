import { response } from 'express';
import request from 'supertest';
import { app } from '../app';

import createConnection from '../database';

describe("Users", () =>{
    beforeAll( async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    })

    it('Should be able to create a new user', async () => {
           
        const response = await request(app).post("/users").send({
            email: 'user@mail.com',
            name: 'user example'
        });

        expect(response.status).toBe(201);
    });

    it('Should not be able to create a existent user', async () => {
           
        const response = await request(app).post("/users").send({
            email: 'user@mail.com',
            name: 'user example'
        });

        expect(response.status).toBe(400);
    });
})
