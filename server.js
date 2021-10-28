const fs = require('fs');
const path = require('path');
const express = require("express");
const { animals } = require("./data/animals");

const PORT = process.env.PORT || 3001;
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
// This helps the package of assets keep together

app.use(express.static('public'));

// v1.0
// function filterByQuery(query, animalsArray) {
//     let filteredResults = animalsArray;
//     if (query.diet) {
//       filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
//     }
//     if (query.species) {
//       filteredResults = filteredResults.filter(animal => animal.species === query.species);
//     }
//     if (query.name) {
//       filteredResults = filteredResults.filter(animal => animal.name === query.name);
//     }
//     return filteredResults;
//   }
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  // Note that we save the animalsArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === "string") {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach((trait) => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }
  if (query.diet) {
    filteredResults = filteredResults.filter((animal) => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter((animal) => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter((animal) => animal.name === query.name);
  }
  // return the filtered results:
  return filteredResults;
}



function findById(id, animalsArray) {
  const result = animalsArray.filter((animal) => animal.id === id)[0];
  return result;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
      path.join(__dirname, './data/animals.json'),
      JSON.stringify({ animals: animalsArray }, null, 2)
    );
    return animal;
}
// This is used to validate
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  }
//Hello get()
app.get("/api/animals", (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

// when http says stuff we can configure what we want it to say, do. 
// you can send back errors, results
// console log wors the same way in the command line.
// we will need both parts to have it work. It will either hang waiting or fail to retrieve. 
// where should direct request to functionality is a route.
// providing server to how url is a roadmap for your server to do stuff for you.
// map some sort of name to some sort of functionality.

app.get("/api/animals/:id", (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();
  
    if (!validateAnimal(req.body)) {
      res.status(400).send('The animal is not properly formatted.');
    } else {
      const animal = createNewAnimal(req.body, animals);
      res.json(animal);
    }
  });

  // runs our ssystem. We want to start our server and listen for any requests
  // how systems interact with server. browser will acess the url will communicat
  // on the other end of the api calls. webpages can be built to interact with them
  // if the basic server is running, it won't really do anything
  // thats because you haven't told it to do anything.
  // the way communicate is to create routes. Building roads? bridges? funnels?
  // when someone makes a get request it is talking through a road
  // get doesn't have to be done with webpage. postman can confiure with an interface like insomia.
  // the nicething about http you can communicate from lots of places. curl can be done from command line
  // 

  // this is added for 11.3 setting up the front end code.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
  });

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
  });

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
  });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
