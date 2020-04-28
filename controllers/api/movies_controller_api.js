const fs = require('fs');
const path = require('path');
const keys = require('../../keys');
const axios = require('axios').default;

let localFileData = [];

module.exports.home = function(req, res){
    console.log('home in movies_controller_api called');

    readFromFiles();

    return res.status(200).json({
        message: 'home in movies_controller_api called'
    });
}

module.exports.getMergedMovieObject = async function(req, res){
    console.log('get merged movie object called');
    let paramId = req.params.id;
    //The id can be both imdb or local id. So search by both the ids
    if(localFileData.length==0){
        console.log("len 0");
        await readFromFiles();
    }
    let movieObjectFoundLocal =  searchMovieByIdFromLocal(paramId);
    console.log(movieObjectFoundLocal);
    if(movieObjectFoundLocal){
        console.log(movieObjectFoundLocal);

        let imdbId = movieObjectFoundLocal.imdbId;
        let movieObjectFoundServer = await readMovieFromServer(imdbId);

        if(movieObjectFoundServer.isSuccessful){

            let mergedMovieObject = mergeBothObjects(movieObjectFoundLocal, movieObjectFoundServer);

            return res.status(200).json({
                data: obj.response,
                message: `getMergedMovieObject called for id ${paramId}`
            });
        }
        else{
            return res.status(500).json({
                message: obj.response
            });
        }
    }
    else{
        return res.status(404).json({
            message: 'The id was not found on the server'
        });
    }
}

let readFromFiles = async function(){
    console.log('read from files called');
    try{
        let moviesPath = path.join(__dirname, '../../movies');
        let fileNames = await fs.readdirSync(moviesPath);
        fileNames.forEach((element)=>{
            let singleMovieFilePath = path.join(moviesPath, '/', element);
            let rawData = fs.readFileSync(singleMovieFilePath);
            let data = JSON.parse(rawData);
            localFileData.push(data);
        })
    }
    catch(err){
        console.log(`${err}`);
    }
}

let readMovieFromServer = async function(imdbId){
    let api_key = keys;
    let url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${api_key}&plot=full`;
    console.log(url);
    let isSuccessful = false;
    let obj = {};
    try{
        let response = await axios.get(url);
        
        if(response){
            isSuccessful = true;
            obj.response = response.data;
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

let searchMovieByIdFromLocal = function(id){
    for(let i=0; i<localFileData.length; i++){
        let element = localFileData[i];
        console.log(`passedid = ${id} element.id=${element.id} element.imdbId=${element.imdbId}`);
        if(element.id==id || element.imdbId==id){
            console.log("found");
            return element;
        }
    }
    return false;
}

let mergeBothObjects = function(local, server){
    
}