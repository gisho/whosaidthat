const {promisify} = require('util');

const redis = require("redis");
const axios = require('axios');





exports.handler = async function(event, context) {

    const client = redis.createClient ({
        host : process.env.ENDPOINT,
        port : process.env.PORT,
        password: process.env.PASSWORD
    });

    const zrevrangeAsync = promisify(client.zrevrange).bind(client);


    client.on("error", function(err) {
        throw err;
    });

    let n = await zrevrangeAsync("scores", 0, 4, "WITHSCORES");
    const result = []
    for (let i = 0; i < n.length-1; i += 2) {
        let score = {}
        score.name = n[i]
        score.score = n[i+1]
        result.push(score)
    }
    client.quit();
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(result)
    };
}