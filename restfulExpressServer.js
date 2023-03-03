'use strict';

let fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const petsPath = path.join(__dirname, 'pets.json');

const express = require('express');
const app = express();
const port = process.env.PORT || 8000; // port that Express will listen to for requests

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// use DATABASE_HOST environmental variable if it exists (set by docker compose),
// or default to localhost if no value is set (run outside docker) 
const DB_HOST = process.env.DATABASE_HOST || 'localhost';

const pool = new Pool({
  user: 'postgres',
  host: DB_HOST,
  database: 'petshop',
  password: 'password',
  port: 5432,
});


// GET request to /pets - Read all the pets
app.get('/pets', (req, res, next) => {
  // Get all the rows in pets table
  pool.query('SELECT * FROM pets', (err, result) => {
    if (err){
      return next(err);
    }
    
    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

// GET request to /pets/:id - Read one pet
app.get('/pets/:id', (req, res, next) => {
  // Get a single pet from the table
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    res.status(404).send("No pet found with that ID");
  }
  console.log("pet ID: ", id);
  
  pool.query('SELECT * FROM pets WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    
    const pet = result.rows[0];
    console.log("Single Pet ID", id, "values:", pet);
    if (pet){
      return res.send(pet);
    } else {
      return res.status(404).send("No pet found with that ID");
    }
  });
});

// POST to /pets - Create a pet
app.post('/pets', (req, res, next) => {
  const age = Number.parseInt(req.body.age);
  const {name, kind} = req.body;
  console.log("Request body name, kind, age", name, kind, age);
  // check request data - if everything exists and id is a number
  if (name && kind && age && !Number.isNaN(age)){
    pool.query('INSERT INTO pets (name, kind, age) VALUES ($1, $2, $3) RETURNING *', [name, kind, age], (err, data) => {
      const pet = data.rows[0];
      console.log("Created Pet: ", pet);
      if (pet){
        return res.send(pet);
      } else {
        return next(err);
      }
    });

  } else {
    return res.status(400).send("Unable to create pet from request body");
  }

});


// PATCH to /pets/:id - Update a pet
app.patch('/pets/:id', (req, res, next) => {
  // parse id from URL
  const id = Number.parseInt(req.params.id);
  // get data from request body
  const age = Number.parseInt(req.body.age);
  const {name, kind} = req.body;
  // if id input is ok, make DB call to get existing values
  if (!Number.isInteger(id)){
    res.status(400).send("No pet found with that ID");
  }
  console.log("PetID: ", id);
  // get current values of the pet with that id from our DB
  pool.query('SELECT * FROM pets WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    console.log("request body name, age, kind: ", name, age, kind);
    const pet = result.rows[0];
    console.log("Single Pet ID from DB", id, "values:", pet);
    if (!pet){
      return res.status(404).send("No pet found with that ID");
    } else {
      // check which values are in the request body, otherwise use the previous pet values
      // let updatedName = null; 
      const updatedName = name || pet.name; 
      // if (name){
      //   updatedName = name;
      // } else {
      //   updatedName = pets.name;
      // }
      const updatedKind = kind || pet.kind;
      const updatedAge = age || pet.age;

      pool.query('UPDATE pets SET name=$1, kind=$2, age=$3 WHERE id = $4 RETURNING *', 
          [updatedName, updatedKind, updatedAge, id], (err, data) => {
        
        if (err){
          return next(err);
        }
        const updatedPet = data.rows[0];
        console.log("updated row:", updatedPet);
        return res.send(updatedPet);
      });
    }    
  });
});


// DELETE to /pets/:id - Delete a pet
app.delete("/pets/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    return res.status(400).send("No pet found with that ID");
  }

  pool.query('DELETE FROM pets WHERE id = $1 RETURNING *', [id], (err, data) => {
    if (err){
      return next(err);
    }
    
    const deletedPet = data.rows[0];
    console.log(deletedPet);
    if (deletedPet){
      // respond with deleted row
      res.send(deletedPet);
    } else {
      res.status(404).send("No pet found with that ID");
    }
  });
});

app.get('/boom', (_req, _res, next) => {
  next(new Error('BOOM!'));
});

app.get('/test', (req, res) => {
  res.send("Hello World!");
});

app.use((_req, res) => {
  res.sendStatus(404);
});

// eslint-disable-next-line max-params
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.sendStatus(500);
});


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', port);
});

module.exports = app;
