require('dotenv').config()
const app=require('../src/app')
const request=require('supertest')

describe('Pruebas',()=>{
    describe('Básicas',()=>{
        it('GET /',async ()=>{
            const response = await request(app).get('/')
            expect(response).toBeDefined()
            expect(response.status).toBe(200)
            expect(response.text).toBe('Hola Mundo!!!')
        })
        it('GET /ping',async ()=>{
            const response = await request(app)
                                    .get('/ping')
            expect(response).toBeDefined()
            expect(response.statusCode).toBe(200)
            expect(response.body).toStrictEqual({msg:'pong'})
        })        
    })
})