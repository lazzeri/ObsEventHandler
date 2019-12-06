var broadcastId;
var userId;
var self = this;
this.peerId = uuidv4();
this.signalingWS = null;
var error = false;
var lastmoment = "";

var newFans = [];
var newInvites = [];

var eventsToTrigger = [];

var userName = "MattyQueenBee";
var waitingbetweenanimations = 3;
//CONSTRUCTORS

class AnimationStrucutre 
{
    //Picture with ending(e.g pic.jpg), Scalse  e.g. 0.5
  constructor(timeinsec,textbool,picbool,userpicbool,mainpos,textfont,textsize,text,textposx,textposy,picturename,pictureposx,pictureposy,picturewidthx,picturewidthy,picturescale,userpicposx,userpicposy,userpicscale,userId)
    {
        this.timeinsec = timeinsec;
        this.textbool = textbool;
        this.picbool = picbool;
        this.userpicbool = userpicbool;
        this.mainpos = mainpos;
        this.textfont = textfont;
        this.textsize = textsize;
        this.text = text;
        this.textposx = textposx;
        this.textposy = textposy;
        this.picturename = picturename;
        this.pictureposx = pictureposx;
        this.pictureposy = pictureposy;
        this.picturewidthx = picturewidthx;
        this.picturewidthy = picturewidthy;
        this.picturescale = picturescale;
        this.userpicposx = userpicposx;
        this.userpicposy = userpicposy;
        this.userpicscale = userpicscale;
        this.userId = userId;
    }
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



//CONSTRUCTS FOR ANIMATIONS
async function RunCode()
{
    FetchBroadcastId();
    CastEvents();
}


async function CastEvents()
{
    while(true)
    {
        if(eventsToTrigger.length != 0)
        {
            var totrigger = eventsToTrigger.shift();

            switch(totrigger.category)
            {
                    case "Invite":
                        var InviteAnimation = new AnimationStrucutre(8,true,true,false,"LowerRight",'"Times New Roman", Times, serif',25,"InviteTest",5,5,"testpic.gif",5,5,400,400,1,0,0,1,"12345");
                        await Animation(InviteAnimation);
                    break;

                    case "Moment":
                        var MomentAnimation = new AnimationStrucutre(8,true,true,false,"LowerRight",'"Times New Roman", Times, serif',25,"MomentTest",5,5,"testpic.gif",5,5,400,400,1,0,0,1,"12345");
                        await Animation(MomentAnimation);
                    break;
                    case "Fan":
                        var FanAnimation = new AnimationStrucutre(8,true,true,false,"LowerRight",'"Times New Roman", Times, serif',25,"FanTest",5,5,"testpic.gif",5,5,400,400,1,0,0,1,"12345");
                        await Animation(FanAnimation);
                    break;
            }
            await sleep(2000);
        }
        await sleep(2000);
    }
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
        	var input =  data.message.comments[i].comment;
            var foundname = data.message.comments[i].name;
            var found = false;

        	if(input.includes("I became a fan!"))
        	{
        		for (b = 0; b < newFans.length; b++) 
        		{
  					if(newFans[b].localeCompare(foundname) == 0);
  					{
                        found = true;
                        console.log("Replica found for fanning found:" + foundname);
                    }
				}

				if(!found)
				{
                    var newEvent = new Event("Fan",foundname,data.message.comments[i].userId,"");
                    eventsToTrigger.push(newEvent); 

					newFans.push(foundname);
                    newEvent.toString();               
				}
        	}

            //Invite Event
            if(input.includes("invited") && input.includes("fans to this broadcast."))
            {
                var matches_array = input.match(/(\d+)/); 

                if(matches_array.length == 2)
                {
                    for (b = 0; b < newInvites.length; b++) 
                    {
                        if(newInvites[b].localeCompare(foundname) == 0);
                        {
                            found = true;
                            console.log("Replica found for inviting found:" + foundname);
                        }
                    }

                    if(!found)
                    {
                        var newEvent = new Event("Invite",foundname,data.message.comments[i].userId,matches_array[0]);
                        newInvites.push(foundname);

                        eventsToTrigger.push(newEvent);
                        newEvent.toString();
                    }
                }
            }

            if(input.includes("captured a moment of"))
            {
                if(lastmoment.localeCompare(foundname) != 0)
                {
                    lastmoment = foundname;
                    var newEvent = new Event("Moment",data.message.comments[i].name,data.message.comments[i].userId,"");
                    eventsToTrigger.push(newEvent); 
                    newEvent.toString();  
                }
                else
                {
                    console.log("Repeated Moment captured");
                }

                             
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

async function Animation(animStruct)
{
    console.log("START");
    if(animStruct.picbool)
    {
        var Picture = document.createElement("div");
        Picture.id = "CustomPicture";
        Picture.style.position = "absolute";
    
        //Variable
        Picture.style.height = animStruct.picturewidthy+"px"; 
        Picture.style.width = animStruct.picturewidthx+"px"; 
        Picture.style.transform = "scale("+ animStruct.picturescale + ")";
        Picture.style.backgroundImage = "url('img/"+ animStruct.picturename +"')";
        Picture.style.top = animStruct.pictureposy+"px";
        Picture.style.left = animStruct.picturepox+ "px";
        
        document.getElementById(animStruct.mainpos).appendChild(Picture);
    }

    if(animStruct.textbool)
    {
        var Text = document.createElement("div");
        Text.id = "Text";
        Text.style.position = "absolute";
    
        //Variable
        Text.innerHTML = animStruct.text;
        Text.style.top = animStruct.textposx + "px";
        Text.style.left = animStruct.textposy + "px";
        Text.style.font.family = animStruct.textfont;
        Text.style.font.size = animStruct.textsize + "px";
    
        document.getElementById(animStruct.mainpos).appendChild(Text);
    }

    if(animStruct.userpicbool)
    {
        var UserPicture = document.createElement("div");
        UserPicture.id = "UserPicture";
        UserPicture.style.position = "absolute";
        UserPicture.style.objectFit= "contain";
    
        UserPicture.style.backgroundImage = "https://ynassets.younow.com/user/live/" +animStruct.userId + "/" + animStruct.userId + ".jpg"; 
        UserPicture.style.height = "100px"; 
        UserPicture.style.width = "100px"; 
        UserPicture.style.transform = "scale("+ animStruct.userpicscale + ")";
        UserPicture.style.top = animStruct.userpicposy+"px";
        UserPicture.style.left = animStruct.userwidthxy+"px";
        document.getElementById(animStruct.mainpos).appendChild(UserPicture);
    }

    await sleep(animStruct.timeinsec * 1000);
    
    if(animStruct.userpicbool)
    {
        var UserPicture = document.getElementById("UserPicture");
        UserPicture.parentNode.removeChild(UserPicture);    
    }


    if(animStruct.picbool)
    {
    var Picture = document. getElementById("Text");
    Picture.parentNode.removeChild(Picture);
    }
 

    if(animStruct.textbool)
    {
    var Text = document.getElementById("CustomPicture");
    Text.parentNode.removeChild(Text);
    }

    console.log("DONE");
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


Event.prototype.toString = function(){console.log("Event: " + this.category + " with Name: " + this.name + " with id: " + this.id + " with inviteVal: " + this.inviteVal);}

function sleep(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

function AddFan()
{
    var newEvent = new Event("Fan","TestName","","");
    eventsToTrigger.push(newEvent); 
}

function AddInvite()
{
    var newEvent = new Event("Invite","TestName","","");
    eventsToTrigger.push(newEvent); 
}


function AddMoment()
{
    var newEvent = new Event("Moment","TestName","","");
    eventsToTrigger.push(newEvent); 
}