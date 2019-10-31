FCC API & Microservices
=======================
Project 03: URL Shortener Microservice
======================================


User Stories:
------------

1. I can POST a URL to `[project_url]/api/shorturl/new` and I will receive a shortened URL in the JSON response.

    Example: `{"original_url":"www.google.com","short_url":1}` 
2. An invalid URL - one that doesn't follow the valid format `http(s)://www.example.com(/more/routes)` - will generate a JSON response 
with an error message.

   Example: `{"error":"invalid URL"}`. 
   
   HINT: You can use the function dns.lookup(host, cb) from the dns core module to check if the submitted url points to a valid site.
3. When I visit the shortened URL, it redirects me to the original link.

### Example creation:
* POST [project_url]/api/shorturl/new - body (urlencoded) :  url=https://www.google.com

### Example usage:
* [this_project_url]/api/shorturl/3

#### Example output (page redirects to):
* https://www.freecodecamp.org/forum/


The Project:
------------

On the front-end:
1. Edit `public/client.js`, `public/style.css` and `views/index.html`
2. Drag in `assets`, like images or music, to add them to your project  
On the back-end:
3. Your app starts at `server.js`
4. Add frameworks and packages in `package.json`
5. Safely store app secrets in `.env` (nobody can see this but you and people you invite)