module.exports.home = function(req, res){
    console.log('home in movies_controller_api called');
    return res.status(200).json({
        message: 'home in movies_controller_api called'
    });
}
