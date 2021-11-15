const config = require("./config.json");
const { ChatClient } = require("dank-twitch-irc");
const fs = require("fs");

// declare client
let client = new ChatClient({
    username: config.username,
    password: config.password,
    rateLimits: "default"
});

// events on client

client.on("connecting", () => console.log("Connecting..."))

client.on("ready", () => {
    console.log("Connected!");
    client.say(config.channel, `Pomyślnie połączono z czatem #${config.channel}`);
});

client.on("close", (error) => {
    if (error != null) 
        console.error("Error: ", error);
    else
        console.error("Error: NULL");
  });

client.on("PRIVMSG", async (msg) => {
    console.log(`[#${msg.channelName}] ${msg.senderUsername}: ${msg.messageText}`);
    if (msg.senderUsername == client.configuration.username){
        return;
    }
    if (!msg.messageText.startsWith(config.prefix)) {
        return;    
    }
    let args = msg.messageText.slice(config.prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    let target = args[0].toLowerCase();
    let bany = require(config.banPath);
    switch(command){
        case "ban":
            if (!config.admins.includes(msg.senderUsername)){
                return;
            }
            console.log(`[ban] -> @${msg.senderUsername}: ${args[0]}`);
            if (bany.includes(target)){
                client.say(msg.channelName, `@${msg.senderUsername}, Ten użytkownik już jest zbanowany!`);
                return;
            }
            bany.push(target);
            fs.writeFileSync(config.banPath, JSON.stringify(bany, null, 4));
            client.say(msg.channelName, `@${msg.senderUsername}, Użytkownik ${target} został zbanowany!`);
            break;
        case "unban":
            if (!config.admins.includes(msg.senderUsername)){
                return;
            }
            console.log(`[unban] -> @${msg.senderUsername}: ${args[0]}`);
            if (!bany.includes(target)){
                client.say(msg.channelName, `@${msg.senderUsername}, Ten użytkownik nie jest zbanowany!`);
                return;                        
            }
            bany = bany.filter(ban => ban != target);
            fs.writeFileSync(config.banPath, JSON.stringify(bany, null, 4));
            client.say(msg.channelName, `@${msg.senderUsername}, Użytkownik ${target} został odbanowany!`);
            break;
        case "isbanned":
            console.log(`[isbanned] -> @${msg.senderUsername}: ${args[0]}`);
            let reply;
            if(bany.includes(target)){
                reply = `@${msg.senderUsername}, podany użytkownik jest zbanowany`;               
            }
            else {
                reply = `@${msg.senderUsername}, podany użytkownik nie jest zbanowany`;
            } 
            client.say(msg.channelName, reply);
            break;
    }
});


//  connect client

client.connect();
client.join(config.channel);