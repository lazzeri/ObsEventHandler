var broadcastId;
var userId;
var self = this;
var newFans;
var eventsToTrigger;
var userName = "";

function RunCode()
{
    if(FetchBroadcastId() == 1)
        FetchData();

    //Loop here to establish connection and to be shure that stream is running
}

function FetchBroadcastId()
{
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
        }
        else
        {
            userId = done.userId;
            broadcastId = done.broadcastId;
            return 1;
        }
  })
  .catch(e => {
    console.log("Error with download");
    return e;
  });
}


function FetchData()
{
	var patt = /w3schools/i;

	//Find broadcastId somehow, could download json and convert
	
	//First Startup Connection:

	this.peerId = uuidv4();
	this.signalingWS = null;
	this.signalingWS = new WebSocket('wss://signaling.younow-prod.video.propsproject.com/?roomId=' + broadcastId + '&isHost=false&peerId=' + self.peerId);

	var pusher = new Pusher('d5b7447226fc2cd78dbb', {
        cluster: "younow"
    });
    var channel = pusher.subscribe("public-channel_" + userId);
    var self = this;


    //For Single likes
    channel.bind('onLikes', function(data) {
        console.log("1 Like");
    });

    //Get Moments, Invites and Shares
    channel.bind('onChat', function(data) {
        for (i = 0; i < data.message.comments.length; i++)
        {
        	var input = data.message.comments[i].name + "    " + data.message.comments[i].comment, '';
        	
        	if(input.includes("I became a fan!"))
        	{
        		var found = false;

        		for each (var name in newFans) 
        		{
  					if(name.localeCompare(data.message.comments[i].name) == 0);
  						found = true;
				}
				//new fan
				if(!found)
				{
					newFans.push(data.message.comments[i].name);
					var newEvent = new Event("fans",data.message.comments[i].name,"","");
					eventsToTrigger.push(Event);					 	
				}
        	}
        } 
    });

    //Get Gifts
    channel.bind('onGift', function(data) {
        for (i = 0; i < data.message.gifts.length; i++)
        {
            console.log(data.message.gifts[i].giftId);    
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


//Create Regex for both
//I became a fan!

var fanpat  = /I became a fan!/i;
var test = "I became a fan!"
console.log(test.includes("I became a fan!"));


//Create queue + for invites and fans make a list of users


//Iterate trough queue with switch(category name, string image source, string name,string inviteamount)

class Event {
  constructor(category,name,image,inviteVal) {
    this.category = category;
    this.name = name;
    this.image = image;
    this.inviteVal = inviteVal;

  }
}


//Next steps create Animation elements for each one and put all in one big animaiton 
//and then cast them as gifs, first try with browser in obs if not just in browser
//Need regex for name + has become a fan! //Cache fan
//Need regex for capturing
//Need regex for invites + amount of invites //Cache invite

