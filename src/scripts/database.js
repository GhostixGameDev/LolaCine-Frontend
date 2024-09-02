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
    const setupQueries = [`CREATE TABLE IF NOT EXISTS \`votos\` 
    (ID tinyint AUTO_INCREMENT PRIMARY KEY, 
    name tinytext NOT NULL DEFAULT 'Propuesta', 
    logo tinytext NOT NULL DEFAULT './assets/propuestas/', 
    votes smallint UNSIGNED NOT NULL DEFAULT 0)`, 
    `CREATE TABLE IF NOT EXISTS \`users\` 
    (ID tinyint AUTO_INCREMENT PRIMARY KEY,
    IP text NOT NULL)`,
     `CREATE TABLE IF NOT EXISTS \`admins\` 
    (ID tinyint AUTO_INCREMENT PRIMARY KEY, 
    username tinytext NOT NULL, 
    password tinytext NOT NULL)`];
    //Query to the database
    setupQueries.forEach(function(query){
      db.query(query, function (err) {
        if (err) throw err;
        console.log("Table setup successfully");
    });
    })
 });
//Exports
export default db;


