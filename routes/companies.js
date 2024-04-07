const express = require('express')
const router = new express.Router();
const ExpressError = require('../expressError')

const db = require('../db');
//################async
router.get('/', async function (req, res, next) {
    try {
        let result = await db.query('SELECT * FROM companies');
        //####################' '
        return res.json({'companies' : result.rows});
    } catch(err) {
        //###############return
        return next(err);
    }
})

router.get('/:code', async function(req, res, next){
    try {
        let code = req.params.code;
        let result = await db.query('SELECT * FROM companies WHERE code = $1' [code]);
        //##################.length
        if (result.rows.length === 0){
            throw new ExpressError(`The company with code ${code} could not be found`, 404)
        } else {
            return res.json({'companies' : response.rows});
        }
    } catch(err) {
        next(err)
    }
})

router.post('/', async function(req, res, next){
    try {
        const { code, name, description } = req.body;
        //###############superfluous?
        let count = 'SELECT COUNT(*) FROM companies';
        

        let results = await db.query('INSERT INTO companies (code, name description) VALUES ($1, $2, $3) RETURNING code, name description',[code, name, description]);
        return res.json({'companies': results.rows[count + 1]});
    } catch(err) {
        next(err);
    }
})

router.put('/:code', async function(req, res, next){
        try {
            let { name, description } = req.body;
            let code = req.params.code;
            //########################## $3
            let results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description', [name, description, code]);
            if (results.rows.length === 0){
                throw new ExpressError('company could not be found', 404)
            } else {
            return res.json({companies : results.rows[0]})
            }
        } catch(err) {
            next(err);
        }
})

router.delete('/:code', async function(req, res, next){
    try {
        let results = await db.query('DELETE FROM companies WHERE (code = $1)', [req.params.code]);
        if (results.rows === 0){
            throw new ExpressError('There is no such company', 404)
        } else {
            //###########status/deleted ' '?
            return res.json({'status': 'deleted'})
        }
    } catch(err){
        next(err);
    }
})



module.exports = router;