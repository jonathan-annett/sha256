# sha256

simple sha256 hashing of strings to either base64 or hex (browser or node)

node.js implementation wraps crypto 

browser implementation wraps window.crypto.subtle (or polyfill if not available)

both implementations use common async api


installation
===

add to **`package.json`**

```json
 "dependencies": {
    "sha256": "github:jonathan-annett/sha256"
   }
```


usage syntax
===

```js

  sha256('a string','base64',function(err,hash){
     console.log(err,hash);
  });

  sha256('another string','hex',function(err,hash){
     console.log(err,hash);
  });

```

simple node example (doesn't serve to browser)
---

```js

   const {sha256} = require ('sha256');

  sha256('a string','base64',function(err,hash){
     console.log(err,hash);
  });

  sha256('another string','hex',function(err,hash){
     console.log(err,hash);
  });

```

node example (that also serves source to browser via express)
---

**`server.js`** 

(main node file that starts express app)

```js

const sha256Node = require ('sha256'), { sha256 } = sha256Node;
const express = require('express');
const app = express();

// you only need 1 of these, but no harm in serving it twice.
sha256Node.express(app,express);// for <script src="/sha256.js"></script>
sha256Node.express(app,express,'/browser/path/to/sha256.js');// for  <script src="/browser/path/to/sha256.js"></script>

app.get("/",function(req,res){
    res.sendFile(require('path').join(__dirname,'index.html');// assumes index.html exists - browser example
});

const listener = app.listen(process.env.PORT||3000, () => {
  console.log("Your app is listening on port " + listener.address().port);   
  
  
  sha256('a string','base64',function(err,hash){
     console.log(err,hash);
  });

  sha256('another string','hex',function(err,hash){
     console.log(err,hash);
  });
  
});    
  

```

browser example (assumes source served as shown above)
---

**`index.html`**


```html
<html>
  <head>
    <title>
      sha256 demo
    <title>
  </head>  
  <body>
    <script src="/sha256.js"></script>
    <script>
      
      
      window.addEventListener('DOMContentLoaded', function (event) {
          
            sha256('a string','base64',function(err,hash){
               console.log(err,hash);
            });

            sha256('another string','hex',function(err,hash){
               console.log(err,hash);
            });
      });


    </script>
  </body>
</html>
```

