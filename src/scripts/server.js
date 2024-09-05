//Imports
//============================================================================
import express from 'express';
import db from './database.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';

//Express setup
//============================================================================
const app = express();
const port = 3304;
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin.
  credentials: true
}));
app.use(cookieParser())

//Functions
function hasUserVoted(ip){
  return new Promise((resolve, reject) => {
    db.query("SELECT ip FROM users WHERE IP = ?", [ip], (error, result) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      if (result.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
function logUserVote(ip){
  db.query("INSERT INTO users (ip) VALUES (?)", [ip], (insertError) => {
    if (insertError) console.log(insertError);
    console.log("Logged vote from: " + ip)
  });
}


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
app.post('/votes/:id', async (request, response) => {
  const { id } = request.params;
  const cookieValue = request.cookies.hasVoted;
  const userIP = request.ip;
  try{
    const hasVoted = cookieValue || await hasUserVoted(userIP);
    if (hasVoted) {
      return response.status(403).json({error: "You can only vote once."});
    }
    //This is the same as the get votes route, but instead of returning the vote amount it adds one vote to the given ID.
    db.query("SELECT votes FROM votos WHERE ID = ?", [id], (error, result) => {
      if (error) return response.status(500).json({ error: error.message });
      if (result.length > 0) {
        const newVotes = result[0].votes + 1;
        db.query("UPDATE votos SET votes = ? WHERE ID = ?", [newVotes, id], (updateError) => {
          if (updateError) return response.status(500).json({ error: updateError.message });
          
          response.cookie("hasVoted", true, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true}); //Flag. This cookie expires after 24 hours.
          logUserVote(userIP); //Log the user ip into the database.
          response.json({ message: `Updated votes for ID ${id} to ${newVotes}` });
        });
      } else {
        response.status(404).json({ error: "No entry found with the given ID" });
      }
    });
  }catch (error){
    console.error(error);
    response.status(500).json({ error: "Something went wrong during the voting process..."});
  }
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