const express = require('express');
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Customer = require('../models/Customer')

router.get('/', ensureAuth, async (req, res) => {
    try{
        const data = await Customer.find({ 'user': req.user.id}).lean()
        let lastName = req.user.lastName
        if(!lastName) lastName = ""
        res.render('customers', {
            userName: req.user.firstName + " " + lastName,
            data,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//@desc Add cutomers in DB
//@route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('customers/add', {
        title: 'Add Customer',
    })
})

router.post('/', ensureAuth, async (req, res) => {
    try {
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
        req.body.user = req.user.id
        let transaction = [{'totalAmount': req.body.totalAmount, 'date': req.body.date, 'credit': req.body.credit, 'debit': req.body.totalAmount - req.body.credit}];
        let customer = {
            'name': req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1).toLowerCase(),
            'contact': req.body.contact,
            'user': req.body.user
        }
        Customer.countDocuments(customer, async (err, count) => { 
            if(count>0){
                await Customer.updateOne(customer, {
                    '$push': { 'transactions': {'$each': transaction, '$sort': {'date': -1}}}
                })
            } else {
                customer.sonOff = req.body.sonOff.charAt(0).toUpperCase() + req.body.sonOff.slice(1).toLowerCase(),
                customer.address = req.body.address.charAt(0).toUpperCase() + req.body.address.slice(1).toLowerCase(),
                customer.careOff = req.body.careOff.charAt(0).toUpperCase() + req.body.careOff.slice(1).toLowerCase();
                customer.transactions = transaction;
                customer.bill = bill;
                await Customer.create(customer)
            }
        }); 
        res.redirect('/customers')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

router.get('/update/:id', ensureAuth, async (req, res) => {
    const customer = await Customer.findOne({'_id': req.params.id}).lean()
    if(!customer) {
        return res.render('error/404')
    }
    if(customer.user != req.user.id) {
        res.redirect('/customers')
    } else {
        res.render('customers/update', {
            title: 'Update Customer',
            customer,
        })
    }
})

router.get('/delete/:id', ensureAuth, (req, res) => {
    Customer.deleteOne({'_id': req.params.id}, (err, obj) => {
        if(!err) {
            res.redirect('/customers')
        } else {
            console.error(err)
            res.render('error/500')
        }
    })
})

router.put('/:id', ensureAuth, async (req, res) => {
    let customer = await Customer.findById(req.params.id).lean()
    if(!customer) {
        return res.render('error/404')
    }
    if(customer.user != req.user.id) {
        res.redirect('/customers')
    } else {
        let data = {
            'name': req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1).toLowerCase(),
            'sonOff': req.body.sonOff.charAt(0).toUpperCase() + req.body.sonOff.slice(1).toLowerCase(),
            'address': req.body.address.charAt(0).toUpperCase() + req.body.address.slice(1).toLowerCase(),
            'contact': req.body.contact,
            'careOff': req.body.careOff.charAt(0).toUpperCase() + req.body.careOff.slice(1).toLowerCase(),
            'user': req.body.user
        }
        customer = await Customer.findOneAndUpdate({'_id': req.params.id}, data, {
            new: true,
            runValidators: true,
        })
        res.redirect('/customers')
    }
})
module.exports = router