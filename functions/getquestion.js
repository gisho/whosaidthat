const {promisify} = require('util');

const redis = require("redis");
const axios = require('axios');


exports.handler = async function(event, context) {

    const rand = function(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };

    const shuffle = function(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const client = redis.createClient ({
        host : process.env.ENDPOINT,
        port : process.env.PORT,
        password: process.env.PASSWORD
    });

    const hgetallAsync = promisify(client.hgetall).bind(client);
    const llenAsync = promisify(client.llen).bind(client);
    const lindexAsync = promisify(client.lindex).bind(client);
    const scanAsync = promisify(client.scan).bind(client);
    const setAsync = promisify(client.set).bind(client);
    const getAsync = promisify(client.get).bind(client);
    let authors = await scanAsync(0, "MATCH", "@*");

    client.on("error", function(err) {
        throw err;
    });

    const {v4: uuidv4} = require('uuid');
    // const body = event.body ? JSON.parse(event.body) : ""
    let gameid = event['queryStringParameters'] ? event['queryStringParameters']['gameid'] : null
    if(!gameid) {
        gameid = uuidv4();
        await setAsync("g:" + gameid, 0, "EX", 600)
    }
    const len = await llenAsync("tweets");
    const randTweet = rand(len)
    const tweet = await lindexAsync("tweets", randTweet);
    const question = JSON.parse(tweet);
    question.tweet = question.tweet.replace(/&amp;/g, '&');
    const options = [];
    let data = await hgetallAsync(question.author)
    let option = {}
    option.pic = data.pic
    option.name = data.name
    option.author = question.author
    options.push(option)
    let opt2 = ""
    while(options.length < 3) {
        let x = rand(authors[1].length);
        let temp = authors[1][x]
        if(!temp || temp === question.author || temp === opt2)
            continue;
        opt2 = temp
        data = await hgetallAsync(temp)
        option = {}
        option.pic = data.pic
        option.name = data.name
        option.author = temp
        options.push(option)
    }
    question.options = shuffle(options)
    question.gameid = gameid
    question.score = await getAsync("g:" + gameid)

    client.quit();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(question)
    };
}