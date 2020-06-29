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
    const hsetAsync = promisify(client.hset).bind(client);
    const hgetallAsync = promisify(client.hgetall).bind(client);

    axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.TKEY;

    client.on("error", function(err) {
        throw err;
    });

    let data = await scanAsync(0, "MATCH", "@*");
    let authors = shuffle(data[1])
    let res = []
    if(authors) {
        let len = authors.length
        for(let i = 0; i < len ; i++) {
            let author = authors[i]
            let temp = await hgetallAsync(author)
            // if( temp.pic ){
            //     continue;
            // }
            let profile = await axios.get(
                'https://api.twitter.com/1.1/users/show.json?screen_name='+author+'&include_entities=false').catch(function (error) {
                console.log("error:" + error);
            });
            if(profile) {
                let pic = profile.data.profile_image_url_https;
                res.push(author + ":" + pic);
                console.log(author + ":" + pic);
                await hsetAsync(author, "pic", pic);
            }
        }
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
        body: JSON.stringify(res)
    };
}