module.exports = async function handler(req, res) {


const clientId =
process.env.DISCORD_CLIENT_ID;


const clientSecret =
process.env.DISCORD_CLIENT_SECRET;


const redirectUri =
"https://pixelbotdashboard.vercel.app/api/discord-login"



try {



/*
================================
START LOGIN
================================
*/


if(!req.query.code){


const discordURL =

"https://discord.com/oauth2/authorize" +

"?client_id=" +
encodeURIComponent(clientId) +

"&response_type=code" +

"&redirect_uri=" +
encodeURIComponent(redirectUri) +

"&scope=" +
encodeURIComponent(
"identify guilds"
);



return res.redirect(
302,
discordURL
);


}





/*
================================
GET ACCESS TOKEN
================================
*/


const tokenResponse =
await fetch(
"https://discord.com/api/oauth2/token",
{


method:"POST",


headers:{

"Content-Type":
"application/x-www-form-urlencoded"

},


body:
new URLSearchParams({

client_id:
clientId,


client_secret:
clientSecret,


grant_type:
"authorization_code",


code:
req.query.code,


redirect_uri:
redirectUri


})


}
);



const token =
await tokenResponse.json();



if(!tokenResponse.ok){


return res
.status(400)
.send(
"Discord authentication failed"
);


}





/*
================================
GET USER
================================
*/


const userResponse =
await fetch(
"https://discord.com/api/users/@me",
{


headers:{

Authorization:

`Bearer ${token.access_token}`


}


}
);



const user =
await userResponse.json();





/*
================================
SAVE USER COOKIE
================================
*/


const userData =

Buffer
.from(

JSON.stringify({

id:user.id,

username:user.username,

avatar:user.avatar,

accessToken:
token.access_token


})

)

.toString("base64");




res.setHeader(

"Set-Cookie",

`pixelbot_user=${userData}; Path=/; HttpOnly; Secure; SameSite=Lax`

);





/*
================================
SEND TO DASHBOARD
================================
*/


return res.redirect(
302,
"/dashboard.html"
);



}



catch(error){


console.error(error);


return res
.status(500)
.send(
"PixelBot login error"
);


}



};
