const {promisify} = require('util');

const redis = require("redis");
const axios = require('axios');


exports.handler = async function(event, context) {
    const shuffle = function(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const client = redis.createClient ({
        host : process.env.ENDPOINT,
        port : process.env.PORT,
        password: process.env.PASSWORD
    });

    const scanAsync = promisify(client.scan).bind(client);
    const getAsync = promisify(client.get).bind(client);
    const setAsync = promisify(client.set).bind(client);
    const lpushAsync = promisify(client.lpush).bind(client);
    const ltrimAsync = promisify(client.ltrim).bind(client);

    let lasttime = await getAsync("lastcall");
    let interval = 3 * 60 * 60 * 1000;
    if( lasttime && (new Date().getTime() - lasttime) < interval ) {
        console.log("too early call");
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            body: JSON.stringify("too early call")
        };
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.TKEY;

    client.on("error", function(err) {
        throw err;
    });

    let data = await scanAsync(0, "MATCH", "@*");
    let authors = shuffle(data[1])
    let max = await getAsync("max")
    let newmax = max
    let res = []
    if(authors) {
        let len = authors.length
        for(let i = 0; i < len ; i++) {
            let author = authors[i]
            let tweets = await axios.get(
                'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name='+author+'&count=50&exclude_replies=true&include_rts=false&trim_user=true&tweet_mode=extended').catch(function (error) {
                console.log("error:" + error);
            });
            if(tweets) {
                let len2 = tweets.data.length
                for(let j = 0; j < len2; j++) {
                    let txt = tweets.data[j].full_text;
                    let id =  tweets.data[j].id_str;
                    if(Number(id) <= Number(max)) {
                        console.log(author + ":" + j);
                        break;
                    }
                    if(Number(id) > Number(newmax)) {
                        newmax = id
                        console.log("newmax:" + newmax + " author:" + author)
                    }
                    if(txt.length < 50 && txt.includes("https:") )
                        continue;
                    let item = {};
                    item.id = id;
                    item.tweet = txt;
                    item.author = author;
                    let data = JSON.stringify(item);
                    await lpushAsync("tweets", data);
                    await setAsync("t:"+id, author);
                    console.log(author+":" + id)
                    res.push(data);
                }
            }
        }
        await setAsync("max", newmax)
        await ltrimAsync("tweets", 0 , 500)
    }

    await setAsync("lastcall", new Date().getTime())

    client.quit();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(res)
    };
}