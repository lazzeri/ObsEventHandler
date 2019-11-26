var broadcastId;
var userId;
var self = this;
this.peerId = uuidv4();
this.signalingWS = null;

var newFans = [];
var newInvites = [];

var eventsToTrigger = [];


var userName = "DashPena";

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
            return;
            //TODO Wait for a while and retry
        }
        else
        {
            if(done.errorCode != 0)
            {
                console.log("User not online or not found");
                //Wait for a while and retry
            }

            userId = done.userId;
            broadcastId = done.broadcastId;
            console.log("Data Found");
            FetchData();
            return;
        }
  })
  .catch(e => {
    console.log(e);
    return e;
  });
}


function FetchData()
{
	var patt = /w3schools/i;
    console.log("Connecting WebSocket");


	//Find broadcastId somehow, could download json and convert
	
	//First Startup Connection:
	this.signalingWS = new WebSocket('wss://signaling.younow-prod.video.propsproject.com/?roomId=' + broadcastId + '&isHost=false&peerId=' + self.peerId);

	var pusher = new Pusher('d5b7447226fc2cd78dbb', {
        cluster: "younow"
    });
    var channel = pusher.subscribe("public-channel_" + userId);


    //For Single likes
    channel.bind('onLikes', function(data) {
        console.log("TESTLIKE")
        console.log("1 Like");
    });

    //Get Moments, Invites and Shares
    channel.bind('onChat', function(data) {
        for (i = 0; i < data.message.comments.length; i++)
        {
        	var input = data.message.comments[i].name + "    " + data.message.comments[i].comment;

            
            //Doesnt include becoming fan of guest
        	if(input.includes("I became a fan!"))
        	{
        		var found = false;

        		for (var name in newFans) 
        		{
  					if(name.localeCompare(data.message.comments[i].name) == 0);
  						{
                            found = true;
                            console.log("Replica found for fanning found:" + data.message.comments[i].name);
                        }
				}
				if(!found)
				{
					newFans.push(data.message.comments[i].name);
					var newEvent = new Event("fans",data.message.comments[i].name,data.message.comments[i].userId,"");
					eventsToTrigger.push(newEvent);	
                    console.log("New Event for Fanning added");				 	
				}
        	}

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
                        console.log("Found invite val = " + matches_array[0]);
                        newInvites.push(data.message.comments[i].name);
                        var newEvent = new Event("invites",data.message.comments[i].name,data.message.comments[i].userId,"");
                        eventsToTrigger.push(newEvent); 
                        console.log("New Event for Inivte added");                 
                    }
                }
            }

            //Get Moments


        } 
    });

    //Get Gifts
    channel.bind('onGift', function(data) {
        console.log("TESTGIFT");
        if(data.message != "undefined")
        {
             for (i = 0; i < data.message.gifts.length; i++)
            {
                console.log(data.message.gifts[i].giftId);    
            }   
        }
       
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Event {
  constructor(category,name,id,inviteVal) {
    this.category = category;
    this.name = name;
    this.id = id;
    this.inviteVal = inviteVal;

  }
}

function Sleep(milliseconds) {
   return new Promise(resolve => setTimeout(resolve, milliseconds));
}


//Create queue + for invites and fans make a list of users

//Iterate trough queue with switch(category name, string id , string name,string inviteamount)


//Next steps create Animation elements for each one and put all in one big animaiton 
//and then cast them as gifs, first try with browser in obs if not just in browser
//Need regex for name + has become a fan! //Cache fan
//Need regex for capturing
//Need regex for invites + amount of invites //Cache invite

 function RunCode()
{
     FetchBroadcastId();
}