/*

sha256(text,function(err,hexdigest){...})
hex2a(hex) -- returns utf8 binary string of hex


*/

(function() {
  
  // borrows code from https://gist.github.com/GaspardP/fffdd54f563f67be8944 for the polyfill
  
  //browser-snip --> remove this from auto served source
  
  const w = typeof window==='object'? window : false;


  if (!w) {
      return nodeJS();
  }
  
  function nodeJS() {
    
    const crypto=require('crypto');
    
    function sha256NodeJs (text,enc,cb)  {
       if (typeof enc==='function') {
          cb  = enc;
          enc = 'base64';
       }
       const hash = crypto.createHash('sha256');
       hash.update(text);
       return cb (undefined,hash.digest(enc).split('=')[0]);
    }
    
    function hex2a(hex) {
       return Buffer.from(hex,'hex').toString('utf8');
    }
    
    function random (length,enc,cb) {
        if (typeof enc==='function') {
          cb  = enc;
          enc = 'base64';
      }
        crypto.randomBytes(length, function(err, buffer) {
           if (err) return cb(err);
           try {
             cb(undefined,buffer.toString(enc));
           } catch(e) {
             cb(e);
           }
        });
    }
    
    function browserCode() {
      if (browserCode.cache) return browserCode.cache;
      const src = require('fs').readFileSync(__filename,'utf8');
      const snip = src.split(['//browser','snip'].join('-'));
      browserCode.cache=snip[0]+snip[2];
      return browserCode.cache;
    }
    
    function express(app,express,url) {
      browserCode();//call this at least once, sets up browserCode.cache 
      app.get(url||'/sha256.js',function(req,res){
        res.type('js');
        res.status(200).send(browserCode.cache);
      });
    }
    
    module.exports = {
      sha256   : sha256NodeJs,
      hex2a    : hex2a,
      randomStr : random,
      selfTest : selfTest,
      express : express
    };
    
  }
  
  //browser-snip const w = window;

  function getSha256Hasher(crypto) {
    
    if (crypto && crypto.subtle) return sha256;
    return usePolyfill();

    function usePolyfill() {
      return function sha256Polyfill(text, enc, cb) {
        if (typeof enc==='function') {
          cb  = enc;
          enc = 'base64';
        }
        const hexStr = sha256(text);
        setTimeout(cb, 0, undefined, enc=== 'hex' ? hexStr : btoa(hex2a(hexStr)).split('=')[0]);
      };

      function sha256(ascii) {
        function rightRotate(value, amount) {
          return (value >>> amount) | (value << (32 - amount));
        }

        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = "length";
        var i, j; // Used as a counter across the whole file
        var result = "";

        var words = [];
        var asciiBitLength = ascii[lengthProperty] * 8;

        //* caching results is optional - remove/add slash from front of this line to toggle
        // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
        // (we actually calculate the first 64, but extra values are just ignored)
        var hash = (sha256.h = sha256.h || []);
        // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
        var k = (sha256.k = sha256.k || []);
        var primeCounter = k[lengthProperty];
        /*/
      var hash = [], k = [];
      var primeCounter = 0;
      //*/

        var isComposite = {};
        for (var candidate = 2; primeCounter < 64; candidate++) {
          if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
              isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
          }
        }

        ascii += "\x80"; // Append Ƈ' bit (plus zero padding)
        while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00"; // More zero padding
        for (i = 0; i < ascii[lengthProperty]; i++) {
          j = ascii.charCodeAt(i);
          if (j >> 8) return; // ASCII check: only accept characters in range 0-255
          words[i >> 2] |= j << (((3 - i) % 4) * 8);
        }
        words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
        words[words[lengthProperty]] = asciiBitLength;

        // process each chunk
        for (j = 0; j < words[lengthProperty]; ) {
          var w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
          var oldHash = hash;
          // This is now the undefinedworking hash", often labelled as variables a...g
          // (we have to truncate as well, otherwise extra entries at the end accumulate
          hash = hash.slice(0, 8);

          for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if
            var w15 = w[i - 15],
              w2 = w[i - 2];

            // Iterate
            var a = hash[0],
              e = hash[4];
            var temp1 =
              hash[7] +
              (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
              ((e & hash[5]) ^ (~e & hash[6])) + // ch
              k[i] +
              // Expand the message schedule if needed
              (w[i] =
                i < 16
                  ? w[i]
                  : (w[i - 16] +
                    (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                      w[i - 7] +
                      (rightRotate(w2, 17) ^
                        rightRotate(w2, 19) ^
                        (w2 >>> 10))) | // s1
                    0);
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 =
              (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
              ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

            hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
          }

          for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
          }
        }

        for (i = 0; i < 8; i++) {
          for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? 0 : "") + b.toString(16);
          }
        }
        return result;
      }
    }

    function sha256Subtle(str,enc) {
      // Get the string as arraybuffer.
      var buffer = new TextEncoder("utf-8").encode(str);
      return crypto.subtle.digest("SHA-256", buffer).then(function(hash) {
        const hexStr = hex(hash);
        return enc==='hex'? hexStr : btoa(hex2a(hexStr)).split('=')[0];
      });
    }

  

    // Should output "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2"
    // We can check the result with:
    // python -c 'from hashlib import sha256;print sha256("foobar").hexdigest()'

    function sha256(str, enc, cb) {
      if (typeof enc==='function') {
          cb  = enc;
          enc = 'base64';
      }
      sha256Subtle(str,enc)
        .then(function(digest) {
          cb(undefined, digest);
        })
        .catch(function(err) {
          cb(err);
        });
    }
    
  }
  
  function hex(buffer) {
    var digest = "";
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
      // We use getUint32 to reduce the number of iterations (notice the `i += 4`)
      var value = view.getUint32(i);
      // toString(16) will transform the integer into the corresponding hex string
      // but will remove any initial "0"
      var stringValue = value.toString(16);
      // One Uint32 element is 4 bytes or 8 hex chars (it would also work with 4
      // chars for Uint16 and 2 chars for Uint8)
      var padding = "00000000";
      var paddedValue = (padding + stringValue).slice(-padding.length);
      digest += paddedValue;
    }

    return digest;
  }
  
  function getRandomizer(crypto) {
    
      if (crypto && crypto.getRandomValues ) return randomValues ;
      return polyfill
    
    
      function polyfill (length,enc,cb) {
        
        if (typeof enc==='function') {
            cb  = enc;
            enc = 'base64';
        }
        
        let u; 
        
        switch (enc) {
            
          case "base64": {
            let res = btoa(Math.random().toString(36).substr(2)).split('=')[0] ;
            while (res.length<length) {
              res += btoa(Math.random().toString(36).substr(2)).split('=')[0];
            } 
            return cb(u,res.substr(0-length));
          }
            
          case "hex": {
            
            let res = Math.random().toString(16);
            while (res.length<length) {
              res +=  Math.random().toString(16);
            } 
            return cb(u,res.substr(0-length));
          }
        }
           
      }
    
      function randomValues (length,enc,cb) {
        if (typeof enc==='function') {
            cb  = enc;
            enc = 'base64';
        }

        var array = new Uint32Array(length);
        crypto.getRandomValues(array);
        const hexStr = hex(array);
        try {
           cb (undefined,enc==='hex'? hexStr : btoa(hex2a(hexStr)).split('=')[0]);
        } catch(e) {
           cb(e)
        }
    }
  }
  
  function hex2a(hex) {
      var str = '';
      for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
  }
  
  function testVectors () {
    //ex https://www.di-mgt.com.au/sha_testvectors.html
    return { 
      "abc" : "ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad",
      ""    : "e3b0c442 98fc1c14 9afbf4c8 996fb924 27ae41e4 649b934c a495991b 7852b855",
      "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq" : "248d6a61 d20638b8 e5c02693 0c3e6039 a33ce459 64ff2167 f6ecedd4 19db06c1",
      "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu" : "cf5b16a7 78af8380 036ce59e 7b049237 0b249b11 e8f07a51 afac4503 7afee9d1",
      "1-million x a" : "cdc76e5c 9914fb92 81a1c7e2 84d73e67 f1809a48 a497200e 046d39cc c7112cd0"
     };
     
  }
  
  function selfTest(hex2a,sha256,cb) {
    
    const vectors = testVectors(),
          inputs  = Object.keys(vectors),
          outputs = inputs.map(function(k){ return vectors[k].replace(/\ /g,"");}),
          results = [],
          onehundredAs  = new Array(101).join('a'), // 100 x 1 = 100
          tenthousandAs = new Array(101).join(onehundredAs), // 100 x 100 = 10,000
          oneMillionAs  = new Array (101).join(tenthousandAs);// 10,000 x 100 =  1,000,000
    
    inputs[inputs.length-1] = oneMillionAs;
    
    let pass=true;
    
    const testn = function(n){
      if (n<inputs.length) {
        
        const started = Date.now();
        sha256(inputs[n],function(err,result){
          const done = Date.now(),elapsed = done-started;
          console.log(result,"vs",outputs[n],elapsed,"msec",inputs[n].length,"bytes hashed");
          const thisPass = !err && outputs[n]===result;
          results.push(thisPass);
          pass = pass && thisPass;
          return testn(n+1);
        });
        
      } else {
        return cb(pass,results);
      }
    };
    
    testn(0);
    
  }

  w.sha256 = getSha256Hasher(w.crypto);
  w.randomStr = getRandomizer(w.crypto);
  w.hex2a = hex2a;
  w.sha256.selfTest = selfTest;
  
})();
