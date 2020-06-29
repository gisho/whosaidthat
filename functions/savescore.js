const redis = require("redis");
const axios = require('axios');

const {promisify} = require('util');



exports.handler = async function(event, context) {

    const client = redis.createClient ({
        host : process.env.ENDPOINT,
        port : process.env.PORT,
        password: process.env.PASSWORD
    });

    client.on("error", function(err) {
        throw err;
    });

    const body = JSON.parse(event.body)
    const name = body["name"];
    const gameid = body["gameid"];

    const zaddAsync = promisify(client.zadd).bind(client);
    const getAsync = promisify(client.get).bind(client);
    const delAsync = promisify(client.del).bind(client);
    const score = await getAsync("g:" + gameid)
    await delAsync("g:" + gameid)
    await zaddAsync("scores", score, name );
    client.quit();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify("success")
    };
}