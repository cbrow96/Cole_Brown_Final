const express = require('express');
const router = express.Router();
const path = require('path');
const statesController =  require('../controllers/statesController');
const verifyCode = require('../middleware/verifyStates');

// route /states/ to all states data
router.get('/', statesController.getAllStates);

// route to each specific get enpoint and use verifyStates middleware for state code checking
router.get('/:state', verifyCode, statesController.getState);
router.get('/:state/funfact', verifyCode, statesController.getRandomFact);
router.get('/:state/capital', verifyCode, statesController.getCapital);
router.get('/:state/nickname', verifyCode, statesController.getNickName);
router.get('/:state/population', verifyCode, statesController.getPopulation);
router.get('/:state/admission', verifyCode, statesController.getAdmission);

router.post('/:state/funfact', verifyCode, statesController.createFact);
router.patch('/:state/funfact', verifyCode, statesController.updateFact);
router.delete('/:state/funfact', verifyCode, statesController.deleteFact);

// Serve index.html for root or /index.html
router.get(/^\/$|\/index(\.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;