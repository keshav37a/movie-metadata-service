const fs = require('fs');
const path = require('path');
const keys = require('../../keys');
const axios = require('axios').default;


module.exports.home = function(req, res){
    console.log('home in movies_controller_api called');

    readFromFiles();

    return res.status(200).json({
        message: 'home in movies_controller_api called'
    });
}

module.exports.getMergedMovieObject = async function(req, res){
    let paramId = req.params.id;
    readMovieFromServer(paramId);
    console.log(paramId);
    let obj = await readMovieFromServer(paramId);
    // console.log(obj.response);
    if(obj.isSuccessful){
        return res.status(200).json({
            data: obj.response,
            message: `getMergedMovieObject called for id ${paramId}`
        });
    }
    else{
        return res.status(200).json({
            message: obj.response
        });
    }
    
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
        // console.log(finalJSONArray);
    }
    catch(err){
        console.log(`${err}`);
    }
    
}

let readMovieFromServer = async function(imdbId){
    let api_key = keys;
    console.log(imdbId);
    let url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${api_key}&plot=full`;
    console.log(url);
    let isSuccessful = false;
    let obj = {};
    try{
        let response = await axios.get(url);
        
        if(response){
            isSuccessful = true;
            obj.response = response.data;
            // console.log(obj.response);
            obj.isSuccessful = isSuccessful;
            return obj;
        }
    }
    catch(err){
        console.log('error');
        isSuccessful = false;
        obj.response = err;
        obj.isSuccessful = isSuccessful;
        return obj;
    }
}