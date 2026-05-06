const express = require('express');
const router = express.Router();
const path = require('path');
const statesController =  require('../controllers/statesController');
const verifyCode = require('../middleware/verifyStates');

// route /states/ to all states data
router.get('/', controllers.getAllStates);

// route to each specific get enpoint and use verifyStates middleware for state code checking
router.get('/:state', verifyCode, statesController.getState);
router.get('/:state/funfact', verifyCode, statesController.getRandomFunFact);
router.get('/:state/capital', verifyCode, statesController.getCapital);
router.get('/:state/nickname', verifyCode, statesController.getNickname);
router.get('/:state/population', verifyCode, statesController.getPopulation);
router.get('/:state/admission', verifyCode, statesController.getAdmission);

router.post('/:state/funfact', verifyCode, statesController.createFunFact);
router.patch('/:state/funfact', verifyCode, statesController.updateFunFact);
router.delete('/:state/funfact', verifyCode, statesController.deleteFunFact);

// Serve index.html for root or /index.html
router.get(/^\/$|\/index(\.html)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;


module.exports = router;