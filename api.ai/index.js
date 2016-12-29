var builder = require('botbuilder');
var restify = require('restify');
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: <MICROSOFT_APP_ID>,
    appPassword: <MICROSOFT_APP_PASSWORD>
});

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer("03898b0ec44c4317b11617a27f05b61c");
var intents = new builder.IntentDialog({
         recognizers: [recognizer]
});

bot.dialog('/',intents);

intents.matches('whatIsWeather',[
    function(session,args){
        var city = builder.EntityRecognizer.findEntity(args.entities,'cities');
        if (city){
            var city_name = city.entity;
            var url = "http://api.apixu.com/v1/current.json?key=7dd32ec48606429db78111355162912&q=" + city_name;
            request(url,function(error,response,body){
                body = JSON.parse(body);
                temp = body.current.temp_c;
                session.send("It's " + temp + " degrees celsius in " + city_name);
            });
        }else{
            builder.Prompts.text(session, 'Which city do you want the weather for?');
        }
    },
    function(session,results){
        var city_name = results.response;
        var url = "http://api.apixu.com/v1/current.json?key=7dd32ec48606429db78111355162912&q=" + city_name;
            request(url,function(error,response,body){
                body = JSON.parse(body);
                temp = body.current.temp_c;
                session.send("It's " + temp + " degrees celsius in " + city_name);
        });
    }
]);

intents.matches('smalltalk.greetings',function(session, args){
    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (fulfillment){
        var speech = fulfillment.entity;
        session.send(speech);
    }else{
        session.send('Sorry...not sure how to respond to that');
    }
});

intents.onDefault(function(session){
    session.send("Sorry...can you please rephrase?");
});


