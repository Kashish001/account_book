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
        const data = customer.transactions[req.params.index]
        data._id = customer._id
        res.render('transaction/update', {
            title: 'Update Transaction',
            transactionIndex: req.params.index,
            data,
        })
    }
})

router.put('/:id', ensureAuth, async (req, res) => {
    let customer = await Customer.findById(req.params.id).lean()
    if(!customer) {
        return res.render('error/404')
    }
    if(customer.user != req.user.id) {
        res.redirect('/customers')
    } else {
        let transaction = {'totalAmount': req.body.totalAmount, 'date': req.body.date, 'credit': req.body.credit, 'debit': req.body.totalAmount - req.body.credit};
        await Customer.updateOne({'_id': req.params.id}, {'$set': { [`transactions.${req.body._index}`]: transaction}})
        let temp = [{'totalAmount': 0, 'date': req.body.date, 'credit': 0, 'debit': 0}];
        await Customer.updateOne({'_id': req.params.id}, {
            '$push': { 'transactions': {'$each': temp, '$sort': {'date': -1}}}
        })
        await Customer.updateOne({'_id': req.params.id}, {'$pull' : {'transactions': {'credit': 0, 'totalAmount': 0, 'debit': 0}}})
        res.redirect('/customers')
    }
})

router.get('/add/:id', ensureAuth, (req, res) => {
    res.render('transaction/add', {
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
            let transaction = [{'totalAmount': req.body.totalAmount, 'date': req.body.date, 'credit': req.body.credit, 'debit': req.body.totalAmount - req.body.credit}];
            try {
                await Customer.updateOne({'_id': req.body._id}, {
                    '$push': { 'transactions': {'$each': transaction, '$sort': {'date': -1}}}
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
                await Customer.updateOne({'_id': req.params.id}, {'$set' : {[`transactions.${req.params.index}`]: null }})
                await Customer.updateOne({'_id': req.params.id}, {'$pull' : {'transactions': null}})
                res.redirect('/customers');
            } catch (err) {
                console.log(err)
                return res.render('error/500')
            }
        }
})

module.exports = router