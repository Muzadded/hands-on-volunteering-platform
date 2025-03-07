const router = require("express").Router();
const client = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
    try {

        // res.json(req.user);

        const user = await client.query("SELECT * FROM users WHERE user_id = $1", [req.user]);
        res.json(user.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
})
module.exports = router;