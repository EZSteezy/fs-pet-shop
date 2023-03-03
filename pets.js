let fs = require('fs');

let input = process.argv[2]
let i = process.argv[3]


if (input === "create" || input === "read" || input === "update" || input === "delete") {
    console.log("Input:", input)
} else {
    console.log("Error")
}

if (input === 'read') {
    fs.readFile('./pets.json', 'utf8', function (err, data) {
        data = JSON.parse(data)

        if (input === 'read' && !process.argv[3]) {
            console.log(data)
        }
        if (input === 'read' && i == undefined) {
            console.error(new Error('that index doesnt exist or you didnt specify one!'));
        }
        if (err) {
            console.log(err);
        } else {
            console.log(data[i])
        }
    })
}
if (input === 'create') {
    let ageVar = parseInt(process.argv[3]);
    let kindVar = process.argv[4];
    let nameVar = process.argv[5];
    let newPet = {};

    fs.readFile('./pets.json', 'utf8', function (error, data) {
        data = JSON.parse(data);

        if (nameVar && kindVar && ageVar) {
            newPet.age = ageVar;
            newPet.kind = kindVar;
            newPet.name = nameVar;
            data.push(newPet);

            fs.writeFile('./pets.json', JSON.stringify(data), function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('New pet added to the file.');
                }
            });
        }
    });
}