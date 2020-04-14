const url = require("url");
const https = require("https");
const Twitter = require("twitter");
const fs = require('fs');
const port = 443;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var options = {
    key: fs.readFileSync('certs/server-key.pem'),
    cert: fs.readFileSync('certs/server-cert.pem')
};

app = https.createServer(options, (request, response) => {
    let query_str = url.parse(request.url, true).query;
    if (query_str.query === undefined) return;

    let creds = JSON.parse("twitter_keys.json");
    const client = new Twitter(
        creds.consumer_key,
        creds.consumer_secret,
        creds.access_token_key,
        creds.access_token_secret
    );


    client.get('search/tweets', {q: query_str.query, tweet_mode: "extended"},
        function (error, tweets, response_) {
            if (error) {
                console.log(error);
                return
            }

            response.writeHead(200, {
                "Content-Type": "text",
                "Access-Control-Allow-Origin": "*"
            });
            tweets = tweets.statuses;
            // tweets = tweets.filter(tweet => !tweet.full_text.includes("RT"));
            let n = tweets.length;
            let chosenTweets = [];
            for (let i = 0; i < 4; i++) {
                let j = getRandomInt(n);
                chosenTweets.push(tweets[j]);
                tweets = tweets.slice(0, j).concat(tweets.slice(j+1, n));
                n -= 1;
                if (n === 0) break;
            }
            let minified = [];
            chosenTweets.forEach(item => {
                let img = item.user.profile_image_url;
                img = img.replace("_normal", "");
                let name = item.user.name;
                let user_name = `@${item.user.screen_name}`;
                let text;
                if (item.retweeted_status) {
                    text = item.retweeted_status.full_text;
                } else {
                    text = item.full_text;
                }
                minified.push({
                    "img": img,
                    "body": text,
                    "name": name,
                    "user_name": user_name
                })
            });
            console.log(minified.length)
            let send_str = JSON.stringify(minified);
            response.write(send_str);
            response.end();
            console.log(send_str);

        })
});

app.listen(port);