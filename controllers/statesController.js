const State = require('../model/States');
const statesData = require('../model/statesData.json');

//Get all combined states data
const getAllStates = async (req, res) => {
    const dbStates = await State.find();
    //map states data from mongodb
    const statesMap = new Map(dbStates.map(s => [s.stateCode, s.funfacts]));

    //combine mongodb with any additional data from json
    let states = statesData.map(state =>{
        const funfacts = statesMap.get(state.code);
        return funfacts ? {...state, funfacts} : state;
    } 
    );

    if (!states) return res.status(204).json({'message': 'No States Found'});

    if (req.query.contig === 'true'){
    states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    }else if (req.query.contig === 'false'){
        states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    res.json(states);
};

//get a single combined state data
const getState = async (req, res) => {
    //search json for statecode
    const state =  statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});

    //search mongo for state code
    const statesdb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    //return combined data if exists in both mongo and json, else just return json data
    const statesRes = statesdb ? { ...state, funfacts: statesdb.funfacts } : state;
    res.json(statesRes);
};

//get random fact on a given state
const getRandomFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state =  statesData.find(s => code === s.code);
    //error if state not found in 
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});

    //search mongo for state code
    const statesdb = await State.findOne({stateCode: code});
    //check if funfacts exist
    if (!statesdb || !statesdb.funfacts?.length) {
    return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const fact = statesdb.funfacts[Math.floor(Math.random() * statesdb.funfacts.length)];

    res.json({funfact: fact});
};

const getCapital = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, capital: state.capital_city});
};

const getNickName = async (req, res) => {
    const state =  statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, nickname: state.nickname});
};

const getPopulation = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, population: state.population});
};

const getAdmission = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, admitted: state.admission_date});
};

const createFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    let state = await State.findOne({stateCode: code});
    const fact = req.body.funfacts;

    if(!fact){
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    if(!Array.isArray(fact)){
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    if(state){
        state.funfacts.push(...fact);
        await state.save();
        res.json(state);
    }else{
        state = await State.create({ stateCode: code, funfacts: fact });
        return res.status(201).json(state);
    }
};

const updateFact = async (req, res) => {
    const {index, fact} = req.body;
    const code = req.params.state.toUpperCase();
    
    const state = statesData.find(s => code === s.code);

    if (!state) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }

    if(!index){
        return res.status(400).json({message: 'State fun fact index value required'});
    }

    if(!fact || typeof fact !== 'string'){
        return res.status(400).json({message: 'State fun fact value required'});
    }

    const statedb = await State.findOne({stateCode: code});

    if(!statedb || !statedb.funfacts?.length) {
        return res.status(404).json({message: `No Fun Facts found for ${s => code === s.code}`});
    }

    if ((index - 1) < 0 || (index - 1) >= statedb.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${s => code === s.code}` });
    }

    statedb.funfacts[index - 1] = fact;
    await statedb.save();
    res.json(statedb);
};

const deleteFact = async (req, res) => {
    const {index} = req.body;
    const statedb = await State.findOne(req.params.state.toUpperCase());
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);

    if(!index){
        return res.status(400).json({message: 'State fun fact index value required'});
    }

    if(!statedb || !statedb.funfact?.length) {
        return res.status(404).json({message: `No Fun Facts found for ${s => req.params.state.toUpperCase() === s.code}`});
    }

    if ((index - 1) < 0 || (index - 1) >= statedb.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${s => req.params.state.toUpperCase() === s.code}` });
    }

    statedb.funfacts.splice((index - 1), 1);
    await statedb.save();
    res.json(statedb);
};


module.exports = {
    getAllStates,
    getState,
    getRandomFact,
    getCapital,
    getNickName,
    getAdmission,
    getPopulation,
    createFact,
    updateFact,
    deleteFact
};
