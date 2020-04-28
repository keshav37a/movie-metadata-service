const fs = require('fs');
const path = require('path');
//keys is an uncomitted js file which contains the value of apikey. Readme.md contains details on how to get this value of api key
const keys = require('../../keys');
const axios = require('axios').default;


//Global object which will hold all the merged data from the catalogue
let mergedFileData = [];

module.exports.searchByParameters = async function(req, res){
    try{
        let queryParams = req.query;
        //If our mergedData array is empty then it will first populate the array
        if(mergedFileData.length==0){
            let localFileData = await readFromFiles();
            await mergeBothObjects(localFileData);
        }
    
        //searchByParameter searches the movies by the parameters passed in the request
        let foundMoviesArray = searchByParameter(queryParams);
        readFromFiles();
        return res.status(200).json({
            data: foundMoviesArray,
            message: 'Success'
        });
    }
    catch(err){
        return res.status(500).json({
            message: `Internal Server error: ${err}`
        })
    }
}

//This will first get the merged data into the array and then return the merged movie item found by id
module.exports.getMergedMovieObject = async function(req, res){
    try{
        let paramId = req.params.id;
    
        if(mergedFileData.length==0){
            let localFileData = await readFromFiles();
            await mergeBothObjects(localFileData);
        }
        
        let movieObjectFound = searchMovieById(paramId);
        if(movieObjectFound){
            return res.status(200).json({
                data: movieObjectFound,
                message: `Success`
            });
        }
        else{
            return res.status(404).json({
                message: 'The id does not exist'
            });
        }
    }
    catch(err){
        return res.status(500).json({
            message: `Internal Server error: ${err}`
        })
    }
    
}

//Reading data from files in our movies folder containing json files
let readFromFiles = async function(){
    try{
        let localFileData = [];
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


//This method gets the movie data from the omdb server of a particular imdbId
let readMovieFromServer = async function(imdbId){

    //getting the api key value from the keys.js file in our root project. If the value is not there then omdb data wont be retrieved
    let api_key = keys;

    let url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${api_key}&plot=full`;
    try{
        let response = await axios.get(url);
        if(response){
            return response.data;
        }
    }
    catch(err){
        console.log(`${err}`);
    }
}

//Search movies by imdb id or local id
let searchMovieById = function(id){
    for(let i=0; i<mergedFileData.length; i++){
        let element = mergedFileData[i];
        if(element.id==id || element.imdbId==id){
            return element;
        }
    }
    return false;
}

//To merge both local objects and data from the server into a single merged array of objects
let mergeBothObjects = async function(localFileData){
    try{
        let movieArrayServer = [];

        //Getting the move data from the server and storing it in the movieServerArray
        for(let i=0; i<localFileData.length; i++){
            let imdbId = localFileData[i].imdbId;
            let movieObjectFoundServer = await readMovieFromServer(imdbId);
            movieArrayServer.push(movieObjectFoundServer);
        }
    
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
            
            for(let key in elementLocal){
                if(key=="title" || key=="description"){
                    continue;
                }
                else if(key=="duration"){
                    delete elementServer.Runtime
                    elementServer["duration"] = `${elementLocal.duration}`;
                }
                else if(key=="userrating"){
                    let obj = {};
                    obj['Source']="Local Database"
                    obj['Value'] = `${elementLocal.userrating.countTotal} stars`
                    elementServer["Ratings"].push(obj);
                }
                else{
                    elementServer[`${key}`] = elementLocal[`${key}`];
                }
            }
            //Pushing the mergedObject in the global mergedFileData array
            mergedFileData.push(elementServer);
        }
    }
    catch(err){
        console.log(`${err}`);
    }
    
}

//Function to search by query parameters passed in the request
let searchByParameter = function(queryParams){
    let foundArray = [];
    for(let i=0; i<mergedFileData.length; i++){
        let movieElement = mergedFileData[i];
        let foundAll = true;
        Object.entries(queryParams).forEach((entry)=>{
            
            let query = entry[0];
            let value = entry[1];

            let movieVal = movieElement[query];

            if(Array.isArray(movieVal)){
                let isPresent = false;
                movieVal.forEach((element)=>{
                    if(element==value){
                        isPresent = true;
                    }
                })
                if(isPresent==false)
                    foundAll = false;
            }
            else if(movieVal!=value){
                foundAll = false;
            }
        })
        if(foundAll){
            foundArray.push(movieElement);
        }
    }
    return foundArray;
}