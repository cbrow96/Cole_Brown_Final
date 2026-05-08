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
        return funfacts ? {...state, funfacts} : {...state, funfacts: []};
    } 
    );

    //no states found 404
    if (!states) return res.status(204).json({'message': 'No States Found'});

    //contiguous states logic
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
    //not found return 404
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});

    //search mongo for state code
    const statesdb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    //return combined data if exists in both mongo and json, else add a funfacts property initialized as an empty array
    //   to json data
    const statesRes = { ...state, funfacts: statesdb ? statesdb.funfacts : [] };
    //take the state combined object with the funfacts property and filter out all null properties
    const filteredStates = Object.fromEntries(Object.entries(statesRes).filter(([_,  value]) => value !== null));
    res.json(filteredStates);
};

//get random fact on a given state
const getRandomFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state =  statesData.find(s => code === s.code);
    //if state not found in json, 404
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});

    //search mongo for state code
    const statesdb = await State.findOne({stateCode: code});
    //check if funfacts exist
    if (!statesdb || !statesdb.funfacts?.length) {
    return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    //choose random fact
    const fact = statesdb.funfacts[Math.floor(Math.random() * statesdb.funfacts.length)];

    res.json({funfact: fact});
};

//returns capital of state if state exists, 404 otherwise
const getCapital = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, capital: state.capital_city});
};

//returns nickname of state if state exists, 404 otherwise
const getNickName = async (req, res) => {
    const state =  statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, nickname: state.nickname});
};

//returns population of state as a comma separated string if state exists, 404 otherwise
const getPopulation = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, population: state.population.toLocaleString()});
};

//returns admission of state if state exists, 404 otherwise
const getAdmission = async (req, res) => {
    const state = statesData.find(s => req.params.state.toUpperCase() === s.code);
    if (!state) return res.status(404).json({message: 'Invalid state abbreviation parameter'});
    res.json({state: state.state, admitted: state.admission_date});
};

//create new fun fact for given state
const createFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    let state = await State.findOne({stateCode: code});
    const fact = req.body.funfacts;

    //if funfact not given, 400
    if(!fact){
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    //if funfact type is not array, 400
    if(!Array.isArray(fact)){
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    if(state){
        //if state exists in mong, add to entity
        state.funfacts.push(...fact);
        await state.save();
        res.json(state);
    }else{
        //if state does not exist in mongo, create entity with funfact
        state = await State.create({ stateCode: code, funfacts: fact });
        return res.status(201).json(state);
    }
};

//updates fun fact at given index if index exists for given state
const updateFact = async (req, res) => {
    const {index, funfact} = req.body;
    const code = req.params.state.toUpperCase();
    
    const state = statesData.find(s => code === s.code);

    if (!state) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }

    if(!index){
        return res.status(400).json({message: 'State fun fact index value required'});
    }

    //if funfact not given or not a string, 400
    if(!funfact || typeof funfact !== 'string'){
        return res.status(400).json({message: 'State fun fact value required'});
    }

    const statedb = await State.findOne({stateCode: code});

    if(!statedb || !statedb.funfacts?.length) {
        return res.status(404).json({message: `No Fun Facts found for ${state.state}`});
    }

    //adjust index given for 0 count
    const finalIndex = (index - 1);

    if (finalIndex < 0 || finalIndex >= statedb.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    statedb.funfacts[finalIndex] = funfact;
    await statedb.save();
    res.json(statedb);
};

//remove fact from state at given index
const deleteFact = async (req, res) => {
    const {index} = req.body;
    const code = req.params.state.toUpperCase();
    const statedb = await State.findOne({stateCode: code});
    const state = statesData.find(s => code === s.code);

    if(!index){
        return res.status(400).json({message: 'State fun fact index value required'});
    }

    if(!statedb || !statedb.funfacts?.length) {
        return res.status(404).json({message: `No Fun Facts found for ${state.state}`});
    }

    finalIndex = (index - 1);

    if (finalIndex < 0 || finalIndex >= statedb.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    statedb.funfacts.splice(finalIndex, 1);
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
