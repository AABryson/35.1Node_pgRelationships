process.env.NODE_ENV='test';
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let testCompany;
beforeEach(async function(){
    //##########################string template literal
    let result = await db.query(`INSERT INTO companies(code, name, description) VALUES ('msoft', 'Microsoft', 'created windows'), ('sny', 'Sony', 'make electronics')`); 
    // RETURNING (code, name, description)`);
    testCompany = result.rows[0]
})
// await db.query(`INSERT INTO companies (code, name, description)
//                     VALUES ('apple', 'Apple', 'Maker of OSX.'),
//                            ('ibm', 'IBM', 'Big blue.')`);

afterEach(async function(){
    await db.query('DELETE FROM companies')
})

afterAll(async function(){
    await db.end();
})

test('get companies', async function(){
    const result = await request(app).get('/companies');
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({
        "companies" : [
            { "code": "msoft", "description": "created windows", "name": "Microsoft" },
            { "code": "sny", "description": "make electronics", "name": "Sony" }
        ]
    });
});


test('get one company', async function(){
    const result = await request(app).get('/companies/msoft');
    //must include [] for array even though only one object in array
    expect(result.body).toEqual({"companies" : [{ "code": "msoft", "description": "created windows", "name": "Microsoft" }]})
})

test('get 404', async function(){
    const result = await  request(app).get('/companies/mdn');
    //don't need '' around 404
    expect(result.statusCode).toEqual(404)
})

test('post to companies', async function(){
    const result = await request(app).post('/companies').send({'code': 'apl', 'name' : 'apple', 'description' : 'makes technology'});
    expect(result.body).toEqual({"companies": [{"code": "apple", "description": "apple"}]}
    )
})

test('update table', async function(){
    const result = await request(app).put('/companies/msoft').send({'name' : 'Merosoft', 'description' : 'creator'});
    expect(result.body).toEqual({"companies" : [{"code" : "msoft", "name" : "Merosoft", "description" : "creator"}]})
})