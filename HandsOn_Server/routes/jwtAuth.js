const router = require("express").Router();
const client = require("../db");
const bcrypt = require("bcrypt");

//Register

router.post("/register",async (req, res) => {
  
    try{

        const {name, gender, dob, email, password, about, skills, causes} = req.body;

        const user = await client.query("SELECT * FROM users WHERE email = $1", [email]);

        if(user.rowCount > 0){
            return res.status(400).send("User already exists");
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await client.query("INSERT INTO users (name, gender, dob, email, password, about, skills, causes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", 
            [name, gender, dob, email, hashedPassword, about, skills, causes]);


    }catch(error){
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

//Login



module.exports = router;
