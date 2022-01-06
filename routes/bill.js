const express = require('express');
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Customer = require('../models/Customer')


router.get('/update/:id/:index', ensureAuth, async (req, res) => {
    const customer = await Customer.findOne({'_id': req.params.id}).lean()
    if(!customer) {
        return res.render('error/404')
    }
    if(customer.user != req.user.id) {
        res.redirect('/customers')
    } else {
        const data = customer.bill[req.params.index]
        data._id = customer._id
        res.render('bill/update', {
            title: 'Update Bill',
            billIndex: req.params.index,
            data,
        })
    }
})

router.put('/:id', ensureAuth, async (req, res) => {
    let customer = await Customer.findById(req.params.id).lean()
    if(!customer) {
        return res.render('error/404')``
    }
    if(customer.user != req.user.id) {
        res.redirect('/customers')
    } else {
        let bill = {'item_name': req.body.item_name, 'item_quant': req.body.item_quant, 
                    'item_rate': req.body.item_rate, 'item_total': req.body.item_total};
        await Customer.updateOne({'_id': req.params.id}, {'$set': { [`bill.${req.body._index}`]: bill}})
        res.redirect('/customers')
    }
})

router.get('/add/:id', ensureAuth, (req, res) => {
    res.render('bill/add', {
        title: 'Add Transaction',
        id: req.params.id
    })
})

router.post('/', ensureAuth, async (req, res) => {
        let customer = await Customer.findById(req.body._id).lean()
        if(!customer) {
            return res.render('error/404')
        }
        if(customer.user != req.user.id) {
            res.redirect('/customers')
        } else {
            let total_rows = Number(req.body.total)
            let bill = []
            for (let row_num = 0; row_num < total_rows; row_num++) {
                let row = {};
                row.item_name = req.body['item_name_'+row_num];
                row.item_quant = (req.body['item_quant_'+row_num]);
                row.item_rate = (req.body['item_rate_'+row_num]);
                if(row.item_name == "" && row.item_quant == "" && row.item_rate == "") {
                    continue;
                }
                row.item_total = (Number(req.body['item_quant_'+row_num]) * Number(req.body['item_rate_'+row_num]));
                bill.push(row)
            }
            try {
                await Customer.updateOne({'_id': req.body._id}, {
                    '$push': { 'bill': {'$each': bill}}
                })
                res.redirect('/customers');
            } catch (err) {
                console.log(err)
                return res.render('error/500')
            }
        }
})

router.get('/delete/:id/:index', ensureAuth, async (req, res) => {
    let customer = await Customer.findById(req.params.id).lean()
        if(!customer) {
            return res.render('error/404')
        }
        if(customer.user != req.user.id) {
            res.redirect('/customers')
        } else {
            try {
                await Customer.updateOne({'_id': req.params.id}, {'$set' : {[`bill.${req.params.index}`]: null }})
                await Customer.updateOne({'_id': req.params.id}, {'$pull' : {'bill': null}})
                res.redirect('/customers');
            } catch (err) {
                console.log(err)
                return res.render('error/500')
            }
        }
})

module.exports = router