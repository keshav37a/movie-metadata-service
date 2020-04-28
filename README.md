# Movie Metadata Search

## Dependencies needed to install

To install any dependency required, just run the command `npm install <dependency_name>`. 
For example `npm install express`

The following dependencies need to be installed before running the project\
*express\
*nodemon\
*axios

## Api key

I have not committed the js file containing the api key. You will have to generate an api key on omdb. Then create a file with name "keys.js" in the root folder containing the project. Paste the following code there.
`let api_key = '<your_api_key>';`
`module.exports = api_key;`

## Running the project

To run the project open the terminal and run the command `npm start`

## Testing the project

After the project has successfully run, In a web browser you can run the following urls to get the data

*`http://localhost:8000/api/movies/`\
  This will return all the movies currently present in the catalogue.\

*`http://localhost:8000/api/movies/3532674`'\
  This will check if a movie with that id exists and return the merged movie data if it does.\

*`http://localhost:8000/api/movies/?originalLanguage=en&languages=de&Production=Dimension Films`\
This will return us the movie object if it matches the above search criteria 
