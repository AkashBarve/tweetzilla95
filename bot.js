//F1: retweet tweets based on parameters each 15 minutes

var twit = require('twit');
var config = require('./config.js');

var Twitter = new twit(config);

var retweet = function() {
	var params = {
		q: 'from:@kumarhanskumar OR from:@OhhJuswe OR from:@akash_barve OR from:@rohith23j OR from:@IngeniousRetard OR #help OR from:@BloodDonorsIn OR donate OR funny OR #meme OR #memes', 
		//OR #BadThingsToRegift',
		// to:@IngeniousRetard from:@IngeniousRetard
		result_type: 'recent',
		lang: 'en'
	}

	Twitter.get('search/tweets', params, function(err, data) {

		if(!err) {
			var retweetId = data.statuses[0].id_str;

			Twitter.post('statuses/retweet/:id', {
				id: retweetId
			}, function(err, response) {
				if(response) {
					console.log('Retweet successful!!');
				}
				if (err) {
					console.log('Something went wrong while Retweeting...');
				}
			});
		}
		else {
			console.log('Something went wrong while Searching..');
		}
	});
}
retweet();
setInterval(retweet, 900000);



//F2: report a new follower on console

var stream = Twitter.stream('user');



stream.on('follow', followed);



function followed(event) {

  var name = event.source.name;

  var screenName = event.source.screen_name;

  console.log('I was followed by: ' + name + ' ' + screenName);

}



//F3: Automated reply to whoever replies to the bots tweets

stream.on('tweet', tweetEvent);


function tweetEvent(tweet) {



  var reply_to = tweet.in_reply_to_screen_name;

  // Who sent the tweet?

  var name = tweet.user.screen_name;

  // What is the text?

  var txt = tweet.text;

  // If we want the conversation thread

  var id = tweet.id_str;



 
  // Tweets by me show up here too

  if (reply_to === 'Tweetzilla95') {


    txt = txt.replace(/@Tweetzilla95/g,'');



    // Start a reply back to the sender

    var replyText = '@'+name + ' This is an automated reply! Live long and prosper! ';

    Twitter.post('statuses/update', { status: replyText, in_reply_to_status_id: id}, tweeted);


    function tweeted(err, reply) {

      if (err) {

        console.log(err.message);

      } else {

        console.log('Tweeted: ' + reply.text);

      }

    }

  }

}

//F4: Use my personal twitter archive to generate and post automated tweets in a random time interval

const Twit = require('twit')
const fs = require('fs')
const csvparse = require('csv').parse
const rita = require('rita')
const path = require('path')

let inputText = ''

const bot = new Twit(config)

const filePath = path.join(__dirname, '../tweetzilla95/twitter-archive/tweets.csv')

const tweetData = () => {
  fs.createReadStream(filePath)
    .pipe(csvparse({
      delimiter: ','
    }))
    .on('data', row => {
      inputText = `${inputText} ${cleanText(row[5])}`
    })
    .on('end', () => {
      const markov = new rita.RiMarkov(10)
      markov.loadText(inputText)
        .toString()
        .substring(0, 140)
      const sentence = markov.generateSentences(1)
      bot.post('statuses/update', {
        status: sentence
      }, (err, data, response) => {
        if (err) {
          console.log(err)
        } else {
          console.log('Markov status tweeted!', sentence)
        }
      })
    })
}

function hasNoStopWords(token) {
  const stopwords = ['@', 'http', 'RT']
  return stopwords.every(sw => !token.includes(sw))
}

function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
    .filter(hasNoStopWords)
    .join(' ')
    .trim()
}

module.exports = tweetData


const markov = require('./bot')

const markovInterval = (Math.floor(Math.random() * 1000)) * 10000

markov();

setInterval(markov, markovInterval);
