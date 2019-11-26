var broadcastId;
var userId;
var self = this;
this.peerId = uuidv4();
this.signalingWS = null;
var error = false;

var newFans = [];
var newInvites = [];

var eventsToTrigger = [];


var userName = "BigbossBozkurt";

function RunCode()
{
    console.log("asdf".localeCompare("asdf"))
     FetchBroadcastId();
     CastEvents();
}

async function Retry()
{
    console.log("Retrying in 10 seconds");
    await sleep(10000);
    error = false;  
    FetchBroadcastId();
}

async function FetchBroadcastId()
{
    console.log("Fetching....");
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrl = 'https://api.younow.com/php/api/broadcast/info/curId=0/user=' + userName;
    var json = fetch(proxyUrl + targetUrl)
  .then(blob => blob.json())
  .then(data => {
    json = JSON.stringify(data, null, 2);
    var done = JSON.parse(json);
        if(json.length < 1)
        {
            console.log("No Data Found");
            error = true;
        }
        else
        {
            if(done.errorCode != 0)
            {
                console.log("User not online or not found");
                error = true;
            }

            if(error)
            {
                Retry();
                return;
            }
            userId = done.userId;
            broadcastId = done.broadcastId;
            console.log("Data Found");
            FetchData();
            return;
        }
  })
  .catch(e => {
    console.log("Some error occured");
    Retry();    
  });
}


function FetchData()
{
    //First Startup Connection:
    console.log("Connecting WebSocket");	

    this.signalingWS = new WebSocket('wss://signaling.younow-prod.video.propsproject.com/?roomId=' + broadcastId + '&isHost=false&peerId=' + self.peerId);
   
    //TODO RESTART AFTER A WHILE!
    this.signalingWS.onerror= async function(event)
    { 
        console.log("Websocket could net be connected,retrying in 10 Seconds");
        await sleep(10000);
        FetchData();
        return;
    }

    console.log("Succesfully Connected");

	var pusher = new Pusher('d5b7447226fc2cd78dbb', {
        cluster: "younow"
    });
    var channel = pusher.subscribe("public-channel_" + userId);


    //For Single likes will be used later for now just console print
    channel.bind('onLikes', function(data) {
        console.log("1 Like");
    });

    //Get Moments, Invites and Shares
    channel.bind('onChat', function(data) {
        for (i = 0; i < data.message.comments.length; i++)
        {
            //data.message.comments[i].name + "    "
        	var input =  data.message.comments[i].comment;
           //console.log(input);

            //Become Fan Event
            //Doesnt include becoming fan of guest
        	if(input.includes("I became a fan!"))
        	{
        		var found = false;

        		for (var name in newFans) 
        		{
                    console.log(name + " compared with " + data.message.comments[i].name + " with i = " + i);
                    if(name != 0)
  					if(name.localeCompare(data.message.comments[i].name) == 0);
  						{
                            found = true;
                            console.log("Replica found for fanning found:" + data.message.comments[i].name);
                        }
				}
				if(!found)
				{
					newFans.push(data.message.comments[i].name);
					var newEvent = new Event("Fan",data.message.comments[i].name,data.message.comments[i].userId,"");
					eventsToTrigger.push(newEvent);	
                    newEvent.toString();               
				}
        	}

            //Invite Event
            if(input.includes("invited") && input.includes("fans to this broadcast."))
            {
                var found = false;
                var matches_array = input.match(/(\d+)/); 

                if(matches_array.length == 2)
                {
                    for (var name in newInvites) 
                    {
                        if(name.localeCompare(data.message.comments[i].name) == 0);
                        {
                            found = true;
                            console.log("Replica found for invite found:" + data.message.comments[i].name);
                        }
                    }
                    if(!found)
                    {
                        newInvites.push(data.message.comments[i].name);
                        var newEvent = new Event("Invite",data.message.comments[i].name,data.message.comments[i].userId,matches_array[0]);
                        newEvent.toString();               
                    }
                }
            }

            //Moments Event
            //Invite Event
            if(input.includes("captured a moment of"))
            {
                var newEvent = new Event("Moment",data.message.comments[i].name,data.message.comments[i].userId,"");
                eventsToTrigger.push(newEvent); 
                newEvent.toString();               
            }
        } 
    });

    //Get Gifts
    channel.bind('onGift', function(data) {
        if(data.message != "undefined")
        {
             for (i = 0; i < data.message.gifts.length; i++)
            {
                console.log("Gift number:" + data.message.gifts[i].giftId);    
            }   
        }
       
    });
}

async function CastEvents()
{
    while(true)
    {
        await sleep(3000);
    }
}




function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Event 
{
  constructor(category,name,id,inviteVal)
    {
    this.category = category;
    this.name = name;
    this.id = id;
    this.inviteVal = inviteVal;
    }
}

Event.prototype.toString = function(){console.log("Event: " + this.category + " with Name: " + this.name + " with id: " + this.id + " with inviteVal: " + this.inviteVal);}

function sleep(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }


