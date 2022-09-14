window.addEventListener('load', function() {
    (function() {
        var old = console.log;
        var logger = document.getElementById('log');
        console.log = function() {
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] == 'object') {
                    logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
                } else {
                    logger.innerHTML += arguments[i] + '<br />';
                }
            }
        }
    })();
	
	document.getElementById('stopbot').disabled = true ;
	document.getElementById('startbot').disabled = false ;

})
window.startbot = startbot;
window.stopbot = stopbot;

let client ;
let channels

function startbot() {
	console.log("startbot");
	document.getElementById('stopbot').disabled = false ;
	document.getElementById('startbot').disabled = true ;
    const inputObj = prepareInputs();
	if ( !inputObj || !inputObj.username || !inputObj.oauth || !inputObj.channels) {
		alert("Please enter all fields!");
		return ;
	}
    channels = inputObj.channels;
    client = new tmi.Client({
        options: {
            debug: true
        },
        identity: {
            username: inputObj.username,
            password: inputObj.oauth
        },
        channels: channels
    });

    client.connect();

    let AnMap = {};
    channels.forEach((userName) => {
        AnMap[userName.substring(1)] = {};
    });

    client.on('chat', (channel, tags, message, self) => {
        // Ignore echoed messages.
        if (self) return;

        if (message.indexOf('Hi') != -1) {
            if (AnMap[channel.substring(1)][tags.username] == 1) {
                client.say(channel, `@${tags['display-name']} Greeted! :( `);
                AnMap[channel.substring(1)][tags.username]++;
            } else if (!(AnMap[channel.substring(1)][tags.username])) {
                client.say(channel, `@${tags['display-name']} Hi~`);
                AnMap[channel.substring(1)][tags.username] = 1;
            } else {
                // noop
            }

        }
    });
}

function stopbot(){
	client.disconnect()
	.then((data) => {
		console.log(data);
		delete client ;
		document.getElementById('stopbot').disabled = true ;
		document.getElementById('startbot').disabled = false ;
	}).catch((err) => {
		console.error(err);
	});
	
	
}

function prepareInputs() {
	let returnObj = undefined ;
	try {
		let rawchannels = document.getElementById('channels');
		channels = rawchannels.value.split(',').map(element => element.trim());
		returnObj = {
			username: document.getElementById('username').value,
			oauth: document.getElementById('oauth').value,
			channels: channels
		}	
	}catch(e){
		console.error(e)
	}
    finally{
		return returnObj ;
	}
}