const fs = require('fs');
const path = require('path');

module.exports.home = function(req, res){
    console.log('home in movies_controller_api called');

    readFromFiles();

    return res.status(200).json({
        message: 'home in movies_controller_api called'
    });
}

let readFromFiles = async function(){
    
    try{
        let finalJSONArray = [];
        let moviesPath = path.join(__dirname, '../../movies');
        let fileNames = await fs.readdirSync(moviesPath);
        fileNames.forEach((element)=>{
            let singleMovieFilePath = path.join(moviesPath, '/', element);
            let rawData = fs.readFileSync(singleMovieFilePath);
            let data = JSON.parse(rawData);
            finalJSONArray.push(data);
        })
        console.log(finalJSONArray);
    }
    catch(err){
        console.log(`${err}`);
    }
    
}
