process.env.NODE_ENV='test';
const request = require('supertest')
const app = require('../app')
const db = require('../db')

let test_invoice;

beforeEach(async function(){
    let result1 = await db.query(`INSERT INTO companies (code, name, description) VALUES ('msoft', 'Microsoft', 'created windows'), ('sny', 'Sony', 'make electronics') RETURNING (code, name, description)`);
    testCompany = result1.rows[0]
    let result2 = await db.query(`INSERT INTO invoices (comp_code, amt)
    VALUES ('msoft', 100), ('sny', 200)`);
    test_invoice = result2.rows
})

afterEach(async function(){
    await db.query('DELETE FROM invoices')
    await db.query('DELETE FROM companies')
})

afterAll(async function(){
    await db.end()
})


test('get invoices', async function(){
    const result = await request(app).get('/invoices');
    expect(result.statusCode).toEqual(200);
    const expectedInvoices = [
        { "comp_code": "msoft", "amt": 100 },
        { "comp_code": "sny", "amt": 200 }
      ];
      
    const invoices = result.body.invoices;
      
    expect(invoices.length).toEqual(expectedInvoices.length); // Ensure the same number of invoices
      
    invoices.forEach((invoice, index) => {
        expect(invoice.comp_code).toEqual(expectedInvoices[index].comp_code);
        expect(invoice.amt).toEqual(expectedInvoices[index].amt);
    });

});

test('get one invoice', async function(){
    const result = await request(app).get('/invoices/msoft');
    expect(result.body).toEqual({"invoice" : [{"add_date": "2024-04-14T07:00:00.000Z","comp_code" : "msoft", "amt" : 100, "id" : expect.any(Number), "paid" : false, "paid_date" : null}]})
})

test('get 404', async function(){
    const result = await request(app).get('/invoices/mdn');
    //######################no ''
    expect(result.statusCode).toEqual(404)
})

test('post to companies', async function(){
    const result = await request(app).post('/invoices').send({'comp_code':'sny', 'paid' : true});
    expect(result.body).toEqual({"invoice" : [{"add_date": "2024-04-14T07:00:00.000Z","comp_code" : "sny", "amt" : 200, "id" : expect.any(Number), "paid" : true, "paid_date" : null}]})
})

test('update table', async function(){
    const result = await request(app).put('/invoices/msoft').send({'amt' : 300});
    expect(result.body).toEqual({"invoice" : [{"id" : expect.any(Number), "comp_code" : "msoft", "amt" : 300, "paid" : false, "add_date": "2024-04-14T07:00:00.000Z", "paid_date" : null}]})
})