const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'User routes not fully implemented yet' });
});

module.exports = router;