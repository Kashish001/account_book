const express = require('express');
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Customer = require('../models/Customer')

router.get('/', ensureAuth, async (req, res) => {
    try {
        const data = await Customer.find({ 'user': req.user.id }).lean()
        let lastName = res.locals.user.lastName
        if(!lastName) lastName = ""
        res.render('null/null_customers', {
            userName: res.locals.user.firstName + " " + lastName,
            data, 
        })
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
})

module.exports = router;