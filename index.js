const port = 8000;
const express = require('express');
const app = new express();

app.listen(port, function(err){
    if(err) { console.log(`${err}`); }

    console.log(`app up and running on port ${port}`);
})