const express = require('express');


const ExpressErorr = require('../expressError');
const db = require('/..db');
//#################new Express
const router = new Express.router();

router.get('/', async function(req, res, nex){
    try {
        let results = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({'invoices' : [results]});
    } catch(err) {
        return next(err);

    }
})

router.get('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        let results = await db.query('SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id=$1', [id]);
        if (results.rows === 0){
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
        let { comp_code, amt } = request.body
        let results = db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.json(results.rows[0])
    } catch(err) {
        next(err)
    }
})

router.put('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        let amt = request.body.amt;
        let results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
        if(results.rows === 0) {
            throw new ExpressError('Invoice cannot be found', 404);
        } else {
            return res.json({'invoice': results.rows[0]})
        }
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