const statesData = require('../model/statesData.json');

const verifyStates = (req, res, next) => {
    const stateCode = req.params.state.toUpperCase();

    const codeCheck = statesData.find(s => s.code === stateCode);
    if (!codeCheck) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    next();
};

module.exports = verifyStates;