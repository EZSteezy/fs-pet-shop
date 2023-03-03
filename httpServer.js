let fs = require('fs');
const http = require('http');
let i;
const port = 8000;

const server = http.createServer( (request, response) => {
    console.log('request', 'received request');
    const URL = request.url;
    const method = request.method;

    console.log(URL);

    if (URL == '/pets')(
        fs.readFile('./pets.json', 'utf8', function(err, data){
            //need to check for errors
            const parsedDataArray = JSON.parse(data);
            console.log('parsedDataArray', parsedDataArray);
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(parsedDataArray));
        })
    )

})

server.listen(port, () => {
    console.log('listening on port ' + port);
})