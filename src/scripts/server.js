//Imports
//============================================================================
import express from 'express';
import db from './database.js';
import cors from 'cors';

//Express setup
//============================================================================
const app = express();
const port = 3304;
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin.
}))

//Routes setup for the users page functions
//============================================================================
//Get vote amount of a given id
app.get('/votes/:id', (request, response) => {
  const { id } = request.params;
  //Makes the database retrieve the vote count from the votes table for the given id.
  db.query("SELECT votes FROM votos WHERE ID = ?", [id], (error, result) => {
    if (error) return response.status(500).json({ error: error.message });
    if (result.length > 0) {
      console.log(`Votes for ID ${id}: ${result[0].votes}`); //We log into the console the vote amount for debug porpouses.
      response.json({ votes: result[0].votes }); //If found, returns the vote count, else changes the response status and returns the corresponding error.
    } else {
      response.status(404).json({ error: "No entry found with the given ID" });
    }
  });
});

//Add a vote to a given ID
app.post('/votes/:id', (request, response) => {
  const { id } = request.params;
  //This is the same as the get votes route, but instead of returning the vote amount it adds one vote to the given ID.
  db.query("SELECT votes FROM votos WHERE ID = ?", [id], (error, result) => {
    if (error) return response.status(500).json({ error: error.message });
    if (result.length > 0) {
      const newVotes = result[0].votes + 1;
      db.query("UPDATE votos SET votes = ? WHERE ID = ?", [newVotes, id], (updateError) => {
        if (updateError) return response.status(500).json({ error: updateError.message });
        response.json({ message: `Updated votes for ID ${id} to ${newVotes}` });
      });
    } else {
      response.status(404).json({ error: "No entry found with the given ID" });
    }
  });
});

//Get all proposals
app.get('/proposals', (request, response) => {
  db.query("SELECT * FROM votos", (error, result) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(result);
  });
});

//Routes setup for the admins page functions
//============================================================================
//Create a new proposal
app.post('/proposals', (request, response) => {
  const { name, logo } = request.body;
  db.query("INSERT INTO votos (name, logo) VALUES (?, ?)", [name, logo], (error, result) => {
    if (error) return response.status(500).json({ error: error.message });
    console.log('All proposals:'); //We log into the console all the current existing proposals
    console.log(result);
    response.json({ message: "Proposal created successfully", proposalId: result.insertId });
  });
});



//Server Listen
//============================================================================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});