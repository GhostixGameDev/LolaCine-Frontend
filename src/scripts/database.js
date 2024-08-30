//Imports
import mysql from "mysql";
//Create connection.
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "votos"
  });
  
  db.connect(function(error) {
    if(error) throw error;
    console.log("Connected!");
    //Creation of votes table only if not exists
    const setupQuery = `CREATE TABLE IF NOT EXISTS \`votos\` 
    (ID tinyint AUTO_INCREMENT PRIMARY KEY, 
    name tinytext NOT NULL DEFAULT 'Propuesta', 
    logo tinytext NOT NULL DEFAULT './assets/propuestas/', 
    votes smallint UNSIGNED NOT NULL DEFAULT 0)`;
    //Query to the database
    db.query(setupQuery, function (err) {
        if (err) throw err;
        console.log("Table setup successfully");
    });
 });
//Exports
export default db;


