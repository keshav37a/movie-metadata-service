const fs = require('fs');
const path = require('path');
const keys = require('../../keys');
const axios = require('axios').default;


let mergedFileData = [];

module.exports.searchByParameters = function(req, res){
    console.log(req.query);
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
    if(mergedFileData.length==0){
        console.log("len 0");
        let localFileData = await readFromFiles();
        await mergeBothObjects(localFileData);
    }
    
    console.log(mergedFileData);

    let movieObjectFound =  searchMovieById(paramId);
    // console.log(movieObjectFoundLocal);
    if(movieObjectFound){
        return res.status(200).json({
            data: movieObjectFound,
            message: `getMergedMovieObject called for id ${paramId}`
        });
    }
    else{
        return res.status(404).json({
            message: 'The id was not found on the server'
        });
    }

}

let readFromFiles = async function(){
    console.log('read from files called');
    let localFileData = [];
    try{
        let moviesPath = path.join(__dirname, '../../movies');
        let fileNames = await fs.readdirSync(moviesPath);
        fileNames.forEach((element)=>{
            let singleMovieFilePath = path.join(moviesPath, '/', element);
            let rawData = fs.readFileSync(singleMovieFilePath);
            let data = JSON.parse(rawData);
            localFileData.push(data);
        })
        return localFileData;
    }
    catch(err){
        console.log(`${err}`);
    }
}

let readMovieFromServer = async function(imdbId){
    console.log('readMovieFromServer called');
    let api_key = keys;
    let url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${api_key}&plot=full`;
    console.log(url);
    try{
        let response = await axios.get(url);
        
        if(response){
            return response.data;
        }
    }
    catch(err){
        console.log('error');
        return false;
    }
}

let searchMovieById = function(id){
    for(let i=0; i<mergedFileData.length; i++){
        let element = mergedFileData[i];
        if(element.id==id || element.imdbId==id){
            return element;
        }
    }
    return false;
}

let mergeBothObjects = async function(localFileData){
    console.log('merge both objects called');
    let movieArrayServer = [];
    for(let i=0; i<localFileData.length; i++){
        let imdbId = localFileData[i].imdbId;
        let movieObjectFoundServer = await readMovieFromServer(imdbId);
        movieArrayServer.push(movieObjectFoundServer);
    }
    // console.log(movieArrayServer);

    for(let i=0; i<localFileData.length; i++){
        let elementLocal = localFileData[i];
        let elementServer = movieArrayServer[i];

        
        let director = elementServer['Director'];
        let directorArray = director.split(',');
        elementServer['Director'] = directorArray;

        let actors = elementServer['Actors'];
        let actorArray = actors.split(',');
        elementServer['Actors'] = actorArray;

        let writer = elementServer['Writer'];
        let writerArray = writer.split(',');
        elementServer['Writer'] = writerArray;
        
        
        // console.log(elementServer);
        for(let key in elementLocal){
            if(key=="title" || key=="description"){
                continue;
            }
            else if(key=="duration"){
                delete elementServer.Runtime
                // console.log(elementLocal.duration);
                elementServer["duration"] = `${elementLocal.duration}`;
            }
            else if(key=="userrating"){
                let obj = {};
                obj['Source']="Local Database"
                obj['Value'] = `${elementLocal.userrating.countTotal} stars`
                elementServer["Ratings"].push(obj);
                // elementServer.Ratings.push(obj);
            }
            else{
                elementServer[`${key}`] = elementLocal[`${key}`];
            }
            // console.log(key);
        }
        mergedFileData.push(elementServer);
    }
    // console.log(movieArrayServer);
    
}

// let getAvgOfItems = function(obj){
//     let numUsers = Object.keys(obj).length-1;
//     let countTotal = obj.countTotal;
//     return countTotal/numUsers;
// }