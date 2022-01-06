const express = require('express');
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Customer = require('../models/Customer')

//@desc Login/Landing Page
//@route GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

//@desc Dashboard
//@route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try{
        const data = await Customer.find({ user: req.user.id }).lean()
        const customers = []
        for (let customer of data) {
            let lastDate = new Date(customer['transactions'][0]['date'])
            let currDate = new Date();
            let diff = parseInt((currDate - lastDate) / (1000 * 60 * 60 * 24), 10)
            if(diff >= 7) {
                customers.push(customer)
            }
        }
        let lastName = req.user.lastName
        if(!lastName) lastName = ""
        res.render('dashboard', {
            userName: req.user.firstName + " " + lastName,
            customers,
        })
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

module.exports = router