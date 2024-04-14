const express = require('express');

const ExpressError = require('../expressError')
const db = require('../db');
//#################new Express
const router = new express.Router();

router.get('/', async function(req, res, next){
    try {
        let results = await db.query('SELECT * FROM invoices');
        return res.json({'invoices' : results.rows});
    } catch(err) {
        return next(err);

    }
})

router.get('/:comp_code', async function(req, res, next){
    try {
        let comp_code = req.params.comp_code;
        let results = await db.query('SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE comp_code=$1', [comp_code]);
        if (results.rows.length === 0){
            throw new ExpressError('Invoice cannot be found', 404);
        } else {
            return res.json({'invoice': results.rows})
        } 
    } catch(err) {
        next(err)
    }
})

router.post('/', async function(req, res, next){
    try {
        //comp_code must already be in companies table
        let { comp_code, amt } = req.body
        let results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.json({'invoice' : results.rows})
    } catch(err) {
        next(err)
    }
})


router.put('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        let amt = req.body.amt;
        let paid = req.body.paid;
        let paidDate = null
        let results = await db.query('Select id, amt, paid, paid_date FROM invoices WHERE id=$1', [id]);
        // if (response.body.paid === false)
        // let results = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
        if(results.rows.length === 0) {
            throw new ExpressError('Invoice cannot be found', 404);
        // Get today's date in YYYY-MM-DD format
        } else {if(results.rows[0].paid === false) {
            paidDate = new Date().toISOString().split('T')[0]; 
            let results = await db.query('UPDATE invoices SET amt=$1, paid_date=$2 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paidDate, id]);
            return res.json({'invoice': results.rows})
            
        }}
    } catch(err) {
        next(err)
    }
})

router.delete('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        let results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);
        if (results.rows === 0){
            throw new ExpressError('Invoice cannot be found', 404);
        } else {
            return res.json({'status' : 'deleted'});
        }
    } catch(err) {
        next(err)
    }
})

module.exports = router