const {promisify} = require('util');

const redis = require("redis");
const axios = require('axios');


exports.handler = async function (event, context) {
    const rand = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    const client = redis.createClient ({
        host : process.env.ENDPOINT,
        port : process.env.PORT,
        password: process.env.PASSWORD
    });

    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    const scanAsync = promisify(client.scan).bind(client);

    client.on("error", function (err) {
        throw err;
    });

    const body = JSON.parse(event.body)
    const answer = body["answer"];
    const tid = body["id"];
    const gameid = body["gameid"];
    const author = await getAsync("t:" + tid);
    const correct = author === answer;
    const response = {}
    response.correct = correct

    let score = 0
    score = await getAsync("g:" + gameid)
    if (!score)
        score = 0

    if (correct) {
        score++
        await setAsync("g:" + gameid, score, "EX", 600)
    }
    response.gameid = gameid
    response.score = score
    client.quit();
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(response)
    };
}