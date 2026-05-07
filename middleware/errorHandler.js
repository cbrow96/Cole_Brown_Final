const errorHandler =  (err, req, res, next) => {
    console.error(err.stack);
    req.status(500).send(err.message);
};

module.exports = errorHandler;