//Show width in pixels for screen size, -- disable when done...:
window.onresize=()=>{
  document.getElementById('resizeInnerW').textContent=window.innerWidth;
};


/*
Steps    Overview--:
0. On pressing the button..
1. If there is nothing entered in the search field, find IP address of current connection via Api..
2. If there is something entered, validate if it`s a Domain if not then IP Address.
3. If it`s a domain name convert it to ip via Dns.resolve ( if more than one ip used for DNS, use first ip address..)
4. If it`s an IP address get Geolocation Details.. 
*/


//global variables..
let url = '';
let errMsgSite =''; // used for messages.. 
let inpTxtHasIp = false;
let inpTxtHasDom = false;
let lat = '';
let lng = '';

let sBRCiPaDD=document.getElementById('sBRCiPaDD');//IP address
let sBRCLoc=document.getElementById('sBRCLoc');//Location
let sBRCLocFlag=document.getElementById('sBRCLocFlag');//Location flag
let sBRCtimeZ=document.getElementById('sBRCtimeZ');// Local Time Zone (UTC)
let sBRCiSP=document.getElementById('sBRCiSP');// ISP ...


let dnsResUrl = 'https://iptracker-api-cdcqaxduasakbjb8.ukwest-01.azurewebsites.net/api/dnsRes/' // used for finding Information for ip address`s and Domain names entered..
                                           // this is the domain name of where the nodejs instance is running.  -old location (https://njsar.glitch.me)
                                           // for local testing use http://127.0.0.1 for all locations in this file,  if nodejs is running locally..
let dnsResUrlget=''; //set flag 'dnsResUrlget' to call dnsRes to convert Domain name to Ip...

let getJsndnsRes = async dnsResUrl => { 
  console.log("[1] getJsndnsRes - Starting DNS lookup for:", dnsResUrl);
  try {
    let response = await fetch(dnsResUrl);
    console.log("[2] getJsndnsRes - Response received, status:", response.status);
    let dnsResdata = await response.json();
    console.log("[3] getJsndnsRes - DNS data received:", JSON.stringify(dnsResdata));
    return dnsResdata;
  } catch (error){
    console.log("[4] getJsndnsRes - ERROR:", error.message);
    return alert(response); 
  } 
};

//Setup Animations for the spinning arrow.:
const effect = new KeyframeEffect(//for Button
iconArrowBtn, // Element to animate.. background-color(lightblue)
[{transform: 'rotate(0deg) scalex(0.5)'},{transform: 'rotate(50000deg) scalex(3)'}], //,{transform: 'scalex(1)'},{transform: 'scalex(2)'}],// Keyframes
{duration: 15000} // Keyframe settings   15sec..  
);
const rotateArrow = new Animation(effect, document.timeline);
//rotateArrow.play();
//rotateArrow.reverse();
//rotateArrow.cancel();// to stop the animation before set duration..



//reset html elements for next search...:
function htmlEreset(){
  console.log("[5] htmlEreset - Resetting UI elements");
  sBRCiPaDD.innerHTML=('127.0.0.1'); //IP ADDRESS
  sBRCLoc.innerText=('City,Country'); // LOCATION
  document.getElementById('sBRCLoc').appendChild(sBRCLocFlag);// previous line 'sBRCLoc.innerText=..' overwrites the inner img tag, so it needs adding again..
  //sBRCLocFlag.src=('./images/icon-arrow.svg'); // LOCATION FLAG
  sBRCLocFlag.src=('./images/WhiteFlag.png'); // LOCATION FLAG
  sBRCtimeZ.innerHTML=("UTC - 00:00 (Local Time)");// --TIMEZONE--<<
  sBRCiSP.innerHTML=("Internet Service Provider");
  console.log("[6] htmlEreset - UI reset complete");
};


// For the Button event
let btnArrHvr = document.getElementById('btnArrHvr');//srchInpTxt
let btnArrHvrMASK = document.getElementById('btnArrHvrMASK');//protect button from multiple presses..
 

// create a specific "pointerdown" event for the window to listen out for the Enter Key
let pntrDowEntEvnt = new PointerEvent('pointerdown');
window.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
      event.preventDefault();
    // Trigger the button element with a click
    //document.getElementById("btnArrHvr").dispatchEvent(pntrDowEntEvnt);
      btnArrHvr.dispatchEvent(pntrDowEntEvnt);
    };
});


//On initial load of the page, let`s dispatch a pointerdown event to press the button ..:
//on behalf of the user.. Re-enable before go live if needed!!
//window.onload=()=>{ btnArrHvr.dispatchEvent(pntrDowEntEvnt);};
// Above commented out so we can display a nice message..

let alertmsgIntro = (""+"\n"+"\
Welcome to the 'IP Address Tracker' WebApp!  "+"\n"+"\
"+"\n"+"\
To search for your public ip address on the map please leave the search field blank and press the search Button or enter a known Domain or Ip address. For best user experience you can unblock trackers for 'ipgeolocation.io' to see the flags. Due to this app running on a free service it can be slower retrieving your results on the first search."+"\n"+"\
"+"\n"+"\
Thank you for trying out this Web App and Have a Great Day."+"\n"+"\
"+"\n"+"\
🌴🔭");


 //lets display the message alertmsgIntro, only once about how it works etc..
  let once = false;//false = it has not yet been displayed..

  function findKey(){ //key IPAddressTracker
    console.log('findKey() function' );
    for (i = 0; i < localStorage.length; i++){//find if key is present in localStorage.
      let key = localStorage.key(i);
      console.log('key ---------:'+key);
      if(key==='IPAddressTracker'){
       let keyV = localStorage.getItem('IPAddressTracker');
       console.log('key and keyV -:'+'IPAddressTracker'+', '+JSON.stringify(keyV))
       once = true; //message has already been displayed..
       }}

      }; 

  let dispOnce = () =>{
      findKey();//If the key exists in localstorage, lets update the once flag now 

    const epochSeconds = Math.round(Date.now() / 1000) //number of seconds since epoch

    console.log('epochSeconds :'+epochSeconds);
if (once) {//key 'IPAddressTracker' exists but could be old and redisplay the msg again after x seconds..
    console.log('Local Storage already set. Date stored:' + localStorage.getItem(key = 'IPAddressTracker'));
    
    
    // if date\time is older than x seconds show the msg again..
    let lsepochSeconds = localStorage.getItem(key = 'IPAddressTracker');

    const epochSecDif = (epochSeconds - lsepochSeconds) ;
    console.log('epochSeconds:'+epochSeconds );
    console.log('lsepochSeconds'+lsepochSeconds );
    console.log('epochSecDif'+epochSecDif );
    if (epochSecDif > 7200 ) { //redisplay the msg after x seconds..: 3600s = 1hr
      console.log('Local Storage date (epochSeconds) is older than'+epochSecDif+' seconds. -- epochSecDif: ' + epochSecDif + ' seconds.');
            console.log('setTimeout displayed!! i:'+i +' '+(localStorage.length -1))
              localStorage.setItem('IPAddressTracker',epochSeconds); 
              
              setTimeout(()=>{
                once = true; //message has already been displayed..
                alert(alertmsgIntro);
                },500)
              
              
              } //else{ }

         }else{ //key 'IPAddressTracker' does not exist, lets set it AND display the msg..
                  localStorage.setItem('IPAddressTracker',epochSeconds);
                  alert(alertmsgIntro);



     }
  



    };

   dispOnce();


// Add event listener for the help tips icon with animated popup
document.addEventListener('DOMContentLoaded', function() {
    const helpTips = document.getElementById('helptips');
    const helpPopup = document.getElementById('helpPopup');
    const closeBtn = document.querySelector('.help-close-btn');
    
    if (helpTips && helpPopup) {
        // Open popup on click
        helpTips.addEventListener('click', function(e) {
            e.stopPropagation();
            helpPopup.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
        
        // Close popup on close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                helpPopup.classList.remove('show');
                document.body.style.overflow = ''; // Restore scrolling
            });
        }
        
        // Close popup on background click
        helpPopup.addEventListener('click', function(e) {
            if (e.target === helpPopup) {
                helpPopup.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
        
        // Close popup on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && helpPopup.classList.contains('show')) {
                helpPopup.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

const osmInfoTip = document.getElementById('osmInfoTip');
const osmInfoPopup = document.getElementById('osmInfoPopup');
const osmCloseBtn = document.querySelector('.osm-close-btn');

if (osmInfoTip && osmInfoPopup) {
      osmInfoTip.addEventListener('click', function(e) {
          e.stopPropagation();
          osmInfoPopup.classList.add('show');
          document.body.style.overflow = 'hidden';
      });

      if (osmCloseBtn) {
          osmCloseBtn.addEventListener('click', function() {
              osmInfoPopup.classList.remove('show');
              document.body.style.overflow = '';
          });
      }

      osmInfoPopup.addEventListener('click', function(e) {
          if (e.target === osmInfoPopup) {
              osmInfoPopup.classList.remove('show');
              document.body.style.overflow = '';
          }
      });

      document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && osmInfoPopup.classList.contains('show')) {
              osmInfoPopup.classList.remove('show');
              document.body.style.overflow = '';
          }
      });
  }

});


// Add bubble animation trigger on button click - continues playing even after release
btnArrHvr.addEventListener('pointerdown', function(e) {
    // Remove previous animation class
    this.classList.remove('bubble-active');
    // Force reflow to restart animation
    void this.offsetWidth;
    // Add animation class to trigger the bubble
    this.classList.add('bubble-active');
});

// Remove the class after animation completes to allow re-triggering
btnArrHvr.addEventListener('animationend', function(e) {
    if (e.animationName === 'bubbleRise') {
        this.classList.remove('bubble-active');
    }
});


  //reset the button style..
  function btnArrHvrStyle(){
    console.log("[7] btnArrHvrStyle - Resetting button style");
    //  btnArrHvrMASK.style.zIndex = "2";//Bring Mask Forwards with z-index 2, to protect button for x amount of time..
    //  btnArrHvrMASK.style.background="linear-gradient(#0000008b,#33016480)";
      btnArrHvrMASK.style.zIndex = "unset";
      btnArrHvrMASK.style.background = "unset";
      btnArrHvr.style.display = "unset";
    };

// ========== DOMAIN VALIDATOR CLASS ==========
class DomainValidator {
  constructor() {
    console.log("[8] DomainValidator - Creating new validator instance");
    this.validTLDs = [];
    this.lastFetchTime = null;
    this.cacheDuration = 24 * 60 * 60 * 1000;
  }
  
  async fetchValidTLDs() {
    console.log("[9] DomainValidator.fetchValidTLDs - Starting fetch");
    try {
      if (this.validTLDs.length > 0 && this.lastFetchTime) {
        const now = Date.now();
        const cacheAge = now - this.lastFetchTime;
        console.log("[10] DomainValidator.fetchValidTLDs - Cache age:", cacheAge, "ms, Cache duration:", this.cacheDuration, "ms");
        if (cacheAge < this.cacheDuration) {
          console.log("[11] DomainValidator.fetchValidTLDs - Using cached TLD list, count:", this.validTLDs.length);
          return this.validTLDs;
        }
        console.log("[12] DomainValidator.fetchValidTLDs - Cache expired, fetching fresh list");
      }
      
      console.log("[13] DomainValidator.fetchValidTLDs - Fetching from IANA");
      const response = await fetch('https://data.iana.org/TLD/tlds-alpha-by-domain.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log("[14] DomainValidator.fetchValidTLDs - Raw data received, length:", text.length);
      
      this.validTLDs = text
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line && !line.startsWith('#'));
      
      this.lastFetchTime = Date.now();
      console.log(`[15] DomainValidator.fetchValidTLDs - ✅ Successfully fetched ${this.validTLDs.length} TLDs from IANA`);
      return this.validTLDs;
    } catch (error) {
      console.error('[16] DomainValidator.fetchValidTLDs - ⚠️ Failed to fetch TLD list from IANA:', error.message);
      if (this.validTLDs.length === 0) {
        console.log('[17] DomainValidator.fetchValidTLDs - 📋 Using fallback TLD list');
        this.validTLDs = [
          'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
          'au', 'uk', 'ca', 'de', 'fr', 'jp', 'cn', 'in',
          'io', 'co', 'us', 'eu', 'nl', 'se', 'no', 'es',
          'it', 'br', 'mx', 'ru', 'za', 'nz', 'sg', 'hk',
          'info', 'biz', 'name', 'pro', 'aero', 'asia',
          'app', 'dev', 'tech', 'online', 'shop', 'store',
          'xyz', 'club', 'online', 'site', 'live', 'media'
        ];
        this.lastFetchTime = Date.now();
        console.log('[18] DomainValidator.fetchValidTLDs - Fallback list loaded, count:', this.validTLDs.length);
      }
      return this.validTLDs;
    }
  }
  
  async isDomainValid(domain) {
    console.log("[19] DomainValidator.isDomainValid - Checking domain:", domain);
    
    if (!domain || typeof domain !== 'string') {
      console.log("[20] DomainValidator.isDomainValid - ❌ Invalid input: domain must be a string");
      return false;
    }
    
    domain = domain.trim();
    
    if (domain.length === 0) {
      console.log("[21] DomainValidator.isDomainValid - ❌ Empty domain");
      return false;
    }
    
    if (domain.length > 253) {
      console.log(`[22] DomainValidator.isDomainValid - ❌ Domain too long (${domain.length} chars, max 253)`);
      return false;
    }
    
    if (!domain.includes('.')) {
      console.log("[23] DomainValidator.isDomainValid - ❌ No dot found in domain");
      return false;
    }
    
    const parts = domain.split('.');
    console.log("[24] DomainValidator.isDomainValid - Domain parts:", parts, "Part count:", parts.length);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`[25] DomainValidator.isDomainValid - Checking part ${i}: '${part}'`);
      
      if (part.length < 1 || part.length > 63) {
        console.log(`[26] DomainValidator.isDomainValid - ❌ Invalid part length: '${part}' (${part.length} chars, must be 1-63)`);
        return false;
      }
      
      if (!/^[a-zA-Z0-9]/.test(part)) {
        console.log(`[27] DomainValidator.isDomainValid - ❌ Part '${part}' doesn't start with alphanumeric`);
        return false;
      }
      
      if (!/[a-zA-Z0-9]$/.test(part)) {
        console.log(`[28] DomainValidator.isDomainValid - ❌ Part '${part}' doesn't end with alphanumeric`);
        return false;
      }
      
      if (!/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(part)) {
        console.log(`[29] DomainValidator.isDomainValid - ❌ Part '${part}' has invalid characters or consecutive hyphens`);
        return false;
      }
    }
    
    if (domain.includes('..')) {
      console.log("[30] DomainValidator.isDomainValid - ❌ Consecutive dots not allowed");
      return false;
    }
    
    const tld = parts[parts.length - 1].toLowerCase();
    console.log("[31] DomainValidator.isDomainValid - TLD extracted:", tld);
    
    if (!/^[a-zA-Z]+$/.test(tld)) {
      console.log(`[32] DomainValidator.isDomainValid - ❌ TLD '${tld}' contains non-alphabetic characters`);
      return false;
    }
    
    if (tld.length < 2) {
      console.log(`[33] DomainValidator.isDomainValid - ❌ TLD '${tld}' is too short (min 2 characters)`);
      return false;
    }
    
    console.log("[34] DomainValidator.isDomainValid - Checking TLD against valid list");
    const validTLDs = await this.fetchValidTLDs();
    
    if (!validTLDs.includes(tld)) {
      console.log(`[35] DomainValidator.isDomainValid - ❌ Invalid TLD: '${tld}' (not in IANA list)`);
      console.log(`[36] DomainValidator.isDomainValid - 📋 First 10 valid TLDs: ${validTLDs.slice(0, 10).join(', ')}...`);
      return false;
    }
    
    console.log(`[37] DomainValidator.isDomainValid - ✅ Domain '${domain}' is valid`);
    return true;
  }
  
  getTLDCount() {
    return this.validTLDs.length;
  }
}
// ========== END DOMAIN VALIDATOR CLASS ==========

// Create a single instance of the validator
const domainValidator = new DomainValidator();
console.log("[38] DomainValidator - Instance created successfully");

// ========== UPDATED BUTTON EVENT LISTENER ==========
btnArrHvr.addEventListener("pointerdown", async function(e) {
  console.log("[39] btnArrHvr - 🚀 Button clicked/activated");
  
  btnArrHvrMASK.style.zIndex = "2";
  btnArrHvrMASK.style.background = "linear-gradient(#0000008b,#33016480)";
  
  rotateArrow.play();
  console.log("[40] btnArrHvr - Spinning arrow animation started");
  
  console.log("[41] btnArrHvr - Button pushed, starting search process");
  htmlEreset();
  
  url = '';
  let srchInpTxtcleaned = '';
  inpTxtHasIp = false;
  inpTxtHasDom = false;
  let dnsResUrlget = ''; // Local variable to avoid conflicts
  
  // If search field is empty - get current IP
  if (srchInpTxt.value === "") {
    console.log("[42] btnArrHvr - Search field is EMPTY, getting current IP address");
    url = 'https://iptracker-api-cdcqaxduasakbjb8.ukwest-01.azurewebsites.net/api/ipgeoApi/';
    console.log("[43] btnArrHvr - URL set to:", url);
    errMsgSite = url;
    console.log("[44] btnArrHvr - Calling getJSONurlFwrapr for IP lookup");
    await getJSONurlFwrapr(); // Wait for the IP lookup
    console.log("[45] btnArrHvr - IP lookup complete, exiting");

    return;
  }
  
  console.log("[46] btnArrHvr - Search field has content:", srchInpTxt.value);
  console.log("Tracker 2");
  
  // Clean up the string
  srchInpTxtcleaned = srchInpTxt.value.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
  srchInpTxtcleaned = srchInpTxtcleaned.split(' ').join('');
  console.log("[47] btnArrHvr - Cleaned input:", srchInpTxtcleaned);
  
  let chkDomIpvalid = srchInpTxtcleaned.split(".");
  console.log("[48] btnArrHvr - Split into parts:", chkDomIpvalid, "Part count:", chkDomIpvalid.length);
  
  // Check if it's a domain (less than 4 parts)
  if (chkDomIpvalid.length > 0 && chkDomIpvalid.length < 4) {
    console.log("[49] btnArrHvr - 🔍 Detected as domain (less than 4 parts)");
    console.log("[50] btnArrHvr - Validate domain name further..");
    
    // AWAIT the domain validation
    console.log("[51] btnArrHvr - Calling domainValidator.isDomainValid for:", srchInpTxtcleaned);
    const isValidDomain = await domainValidator.isDomainValid(srchInpTxtcleaned);
    
    if (isValidDomain) {
      console.log("[52] btnArrHvr - ✅ Domain is valid, proceeding with DNS lookup");
      console.log("[53] btnArrHvr - Domain Valid, lookup domain:", srchInpTxtcleaned);
      dnsResUrlget = dnsResUrl + srchInpTxtcleaned;
      console.log("[54] btnArrHvr - DNS URL constructed:", dnsResUrlget);
      inpTxtHasDom = true;
      
      // Now do the DNS lookup
      console.log("[55] btnArrHvr - Proceeding with DNS lookup for:", dnsResUrlget);
      rotateArrow.play();
      
      try {
        console.log("[56] btnArrHvr - Calling getJsndnsRes with URL:", dnsResUrlget);
        const dnsdata = await getJsndnsRes(dnsResUrlget);
        
        if (dnsdata) {
          console.log("[57] btnArrHvr - DNS data received");
          console.log("[58] btnArrHvr - dnsdata type:", Array.isArray(dnsdata) ? 'Array' : typeof dnsdata);
          console.log("[59] btnArrHvr - dnsdata content:", JSON.stringify(dnsdata));
          
          // ========== FIX: Check for error object (has 'code' property) ==========
            if (dnsdata.errno) {
                console.log("[60] btnArrHvr - ⚠️ DNS error detected, errno:", dnsdata.errno);
                btnArrHvrStyle();
                rotateArrow.cancel();
                console.log("[61] btnArrHvr - DNS error details:", JSON.stringify(dnsdata));
            
                const dnsErrors = {
                    'ENOTFOUND': `The domain '${srchInpTxtcleaned}' could not be found. Please check the domain and try again.`,
                    'ENODATA':   `No IP address records found for '${srchInpTxtcleaned}'.`,
                    'ETIMEOUT':  `DNS lookup timed out for '${srchInpTxtcleaned}'. Please try again.`,
                    'ESERVFAIL': `DNS server failed for '${srchInpTxtcleaned}'. Please try again later.`,
                    'EREFUSED':  `DNS lookup was refused for '${srchInpTxtcleaned}'. Please try again later.`,
                    'EBADNAME':  `'${srchInpTxtcleaned}' is not a valid domain name.`,
                };
              
                const friendlyMsg = dnsErrors[dnsdata.errno] ||
                    `DNS error (${dnsdata.errno}) for '${dnsdata.hostname}'. Please check the domain and try again.`;
              
                console.log("[62] btnArrHvr - Showing friendly DNS error:", friendlyMsg);
                alert(friendlyMsg);
                return;
            }

          
          // ========== FIX: Check if we have an array of IP addresses ==========
          if (Array.isArray(dnsdata) && dnsdata.length > 0) {
            console.log("[66] btnArrHvr - ✅ DNS returned array with", dnsdata.length, "IP addresses");
            
            // Check if we have at least one IP
            if (dnsdata[0]) {
              console.log("[67] btnArrHvr - First IP address:", dnsdata[0]);
              // IP exists, use the first one in the list by default
              let ipLstArr = [];
              for (let i = 0; i < dnsdata.length; i++) {
                ipLstArr.push(dnsdata[i]);
                console.log("[68] btnArrHvr - IP " + (i + 1) + ":", dnsdata[i]);
              }
              
              // If more than one IP, show list
              if (dnsdata.length > 1) {
                console.log("[69] btnArrHvr - Multiple IPs found, showing list");
                let alertmsg = "A list of IP addresses have been found for the domain '" + srchInpTxtcleaned + "', using the first IP as the location:\n" + ipLstArr.join('\n') + "\nList can be copied to clipboard using Ctrl+C";
                prompt(alertmsg, ipLstArr.join('\n'));
              }
              
              console.log("[70] btnArrHvr - Tracker 6 - Setting up geolocation lookup");
              inpTxtHasIp = true;
              url = 'https://iptracker-api-cdcqaxduasakbjb8.ukwest-01.azurewebsites.net/api/ipgeoApi/' + dnsdata[0];
              console.log("[71] btnArrHvr - Geolocation URL:", url);
              //comment out to leave the domain name in the search field..
              //srchInpTxt.value = dnsdata[0];
              // Now get the geolocation data for this IP
              console.log("[72] btnArrHvr - Calling getJSONurlFwrapr for geolocation");
              await getJSONurlFwrapr();
              dnsResUrlget = "";
              console.log("[73] btnArrHvr - Geolocation lookup complete");
              
            } else {
              console.log("[74] btnArrHvr - ❌ No IP address found in DNS response");
              rotateArrow.cancel();
              btnArrHvrStyle();
              alert("No IP address exists for domain: " + srchInpTxtcleaned);
              return;
            }
          } else {
            // ========== FIX: Unexpected response format ==========
            console.log("[75] btnArrHvr - ⚠️ Unexpected dnsdata format (not an array):", typeof dnsdata);
            rotateArrow.cancel();
            btnArrHvrStyle();
            alert("Unexpected response from DNS lookup. Please try again.");
            return;
          }
        } else {
          console.log("[76] btnArrHvr - ⚠️ DNS data is null/undefined");
          rotateArrow.cancel();
          btnArrHvrStyle();
          alert("No DNS data received. Please try again.");
          return;
        }
      } catch (error) {
        console.log("[77] btnArrHvr - ❌ Error during DNS lookup:", error.message);
        rotateArrow.cancel();
        btnArrHvrStyle();
        console.error("[78] btnArrHvr - Error details:", error);
        alert("Error fetching DNS data for '" + srchInpTxtcleaned + "'. Please check the internet connection.");
        return;
      }
      
    } else {
      console.log("[79] btnArrHvr - ❌ Domain validation FAILED for:", srchInpTxtcleaned);
      inpTxtHasDom = false;
      alert('Invalid domain name entered: ' + srchInpTxtcleaned);
      btnArrHvrStyle();
      rotateArrow.cancel();
      console.log("[80] btnArrHvr - Exiting due to invalid domain");
      return;
    }
    
  } else if (chkDomIpvalid.length === 4) {
    // Check if it's a valid IP address
    console.log("[81] btnArrHvr - 🔍 Detected as potential IP address (4 parts)");
    const isValidIp = value => (/^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(value));
    if (isValidIp(srchInpTxtcleaned)) {
      console.log("[82] btnArrHvr - ✅ Valid IP address:", srchInpTxtcleaned);
      inpTxtHasIp = true;
      url = 'https://iptracker-api-cdcqaxduasakbjb8.ukwest-01.azurewebsites.net/api/ipgeoApi/' + srchInpTxtcleaned;
      console.log("[83] btnArrHvr - Geolocation URL for IP:", url);
      console.log("[84] btnArrHvr - Calling getJSONurlFwrapr for IP geolocation");
      await getJSONurlFwrapr();
    } else {
      console.log("[85] btnArrHvr - ❌ Invalid IP address:", srchInpTxtcleaned);
      rotateArrow.cancel();
      btnArrHvrStyle();
      alert(srchInpTxtcleaned + " is not a valid IP address. Please enter a correct IP Address.");
      return;
    }
  } else {
    console.log("[86] btnArrHvr - ⚠️ Input format not recognized (parts:", chkDomIpvalid.length, ")");
    rotateArrow.cancel();
    btnArrHvrStyle();
    alert("Please enter a valid domain name or IP address.");
    return;
  }
  
  console.log("[87] btnArrHvr - 🔚 Button event handler completed");
}); // End Button function

// ========== UPDATED getJSONurlFwrapr FUNCTION ==========
async function getJSONurlFwrapr() {
  console.log("[88] getJSONurlFwrapr - 🚀 Function called with url:", url);
  
  // Define getJSON function
  const getJSON = async url => {
    console.log("[89] getJSONurlFwrapr.getJSON - 📡 Fetching URL:", url);
    try {
      const response = await fetch(url);
      console.log("[90] getJSONurlFwrapr.getJSON - Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("[91] getJSONurlFwrapr.getJSON - ✅ Raw data received (length:", JSON.stringify(data).length, "bytes)");
      return data;
    } catch (error) {
      console.log("[92] getJSONurlFwrapr.getJSON - ❌ Error:", error.message);
      throw error;
    }
  };
  
  if (srchInpTxt.value === "" || inpTxtHasIp) {
    console.log("[93] getJSONurlFwrapr - Conditions met: srchInpTxt.value === '', inpTxtHasIp =", inpTxtHasIp);
    console.log("Tracker 8");
    rotateArrow.play();
    let getUserIPChk = false;
    
    async function getUserIP() {
      console.log("[94] getJSONurlFwrapr.getUserIP - Starting user IP retrieval");
      if (srchInpTxt.value === "" && inpTxtHasIp === false) {
        console.log("[95] getJSONurlFwrapr.getUserIP - Getting public IP for empty search");
        errMsgSite = "https://api.bigdatacloud.net/data/client-ip";
        
        try {
          console.log("[96] getJSONurlFwrapr.getUserIP - Fetching from:", errMsgSite);
          const response = await fetch('https://api.bigdatacloud.net/data/client-ip', { signal: AbortSignal.timeout(5000) });
          console.log("[97] getJSONurlFwrapr.getUserIP - Response status:", response.status);
          if (response.ok) {
            const respData = await response.json();
            console.log("[98] getJSONurlFwrapr.getUserIP - User IP data received");
            console.log('[99] getJSONurlFwrapr.getUserIP - User IP Address:', respData.ipString);

            srchInpTxt.value = respData.ipString; // Update the input field(srchInpTxt) with the IP

            url = url + respData.ipString;
            console.log("[100] getJSONurlFwrapr.getUserIP - Updated URL with IP:", url);
            getUserIPChk = true;
            console.log("[101] getJSONurlFwrapr.getUserIP - getUserIPChk set to true");
          } else {
            console.log("[102] getJSONurlFwrapr.getUserIP - Response not OK, status:", response.status);
            throw new Error('Something went wrong');
          }
        } catch (error) {
          console.log("[103] getJSONurlFwrapr.getUserIP - ❌ Error getting user IP:", error.message);
          setTimeout(rotateArrow.cancel, 500);
          btnArrHvrStyle();
          alert("Could not retrieve your IP address. Please check your internet connection.");
        }
      } else {
        console.log("[104] getJSONurlFwrapr.getUserIP - Skipping IP retrieval (search field has content or IP already set)");
      }
    }
    
    await getUserIP();
    console.log("[105] getJSONurlFwrapr - Tracker 11 - Variables before geolocation:");
    console.log('[106] getJSONurlFwrapr - srchInpTxt.value:', srchInpTxt.value);
    console.log("[107] getJSONurlFwrapr - inpTxtHasIp:", inpTxtHasIp);
    console.log('[108] getJSONurlFwrapr - url:', url);
    console.log('[109] getJSONurlFwrapr - getUserIPChk:', getUserIPChk);
    
    if (getUserIPChk || inpTxtHasIp) {
      console.log("[110] getJSONurlFwrapr - ✅ Conditions met for geolocation lookup");
      try {
        console.log("[111] getJSONurlFwrapr - 📡 Fetching geolocation data from:", url);
        errMsgSite = url; //if there is an error update errMsgSite to geolocation via Nodejs..
        const data = await getJSON(url);
        console.log("[112] getJSONurlFwrapr - ✅ Geolocation data received and parsed");
        console.log("[113] getJSONurlFwrapr - IP:", data.ip, "| City:", data.city, "| Country:", data.country_name);
        
        if (data) {
          if (data.message) {
            console.log("[114] getJSONurlFwrapr - ⚠️ API returned error message:", data.message);
            rotateArrow.cancel();
            btnArrHvrStyle();
            alert("Data error message: " + JSON.stringify(data));
          } else {
            console.log("[115] getJSONurlFwrapr - ✅ Valid geolocation data for IP:", data.ip);
            console.log("[116] getJSONurlFwrapr - Updating UI with location data");
            sBRCiPaDD.innerHTML = data.ip;
            sBRCLoc.innerText = (data.city + "," + data.country_code3 + " " + data.zipcode + " ");
            document.getElementById('sBRCLoc').appendChild(sBRCLocFlag);
            sBRCLocFlag.src = (data.country_flag);
            let HHMM = String(data.time_zone.current_time).slice(11, 16);
            sBRCtimeZ.innerHTML = (HHMM + " (Local Time)");
            sBRCiSP.innerHTML = data.isp;
            console.log("[117] getJSONurlFwrapr - UI updated with location data");
            
            let width = '', height = '';
            if (window.innerWidth > '700') {
              width = '1440';
              height = '522';
              console.log("[118] getJSONurlFwrapr - Desktop screen size detected");
            } else {
              width = '375';
              height = '530';
              console.log("[119] getJSONurlFwrapr - Mobile screen size detected");
            }
            
            console.log("[120] getJSONurlFwrapr - 🗺️ Calling getmap with coordinates:", data.latitude, data.longitude);
            getmap(data.latitude, data.longitude, width, height);
          }
        } else {
          console.log("[121] getJSONurlFwrapr - ❌ Invalid data returned (null)");
          alert("Error: Invalid data returned.");
          rotateArrow.cancel();
          btnArrHvrStyle();
        }
      } catch (error) {
        console.log("[122] getJSONurlFwrapr - ❌ Error fetching geolocation:", error.message);
        rotateArrow.cancel();
        btnArrHvrStyle();
        htmlEreset();
        alert("Unable to reach the site: " + errMsgSite + " Please check internet connection.");
        console.error("[123] getJSONurlFwrapr - Unable to reach site:", errMsgSite);
        console.error("[124] getJSONurlFwrapr - Error details:", error);
      }
    } else {
      console.log("[125] getJSONurlFwrapr - ⚠️ getUserIPChk and inpTxtHasIp both false, skipping geolocation");
    }
  } else {
    console.log("[126] getJSONurlFwrapr - ⚠️ Conditions not met for IP lookup (srchInpTxt.value:", srchInpTxt.value, ", inpTxtHasIp:", inpTxtHasIp, ")");
  }
  console.log("[127] getJSONurlFwrapr - 🔚 Function completed");
}
// ========== END getJSONurlFwrapr FUNCTION ==========



//global variables - OpenStreetMaps..
let lti = '';
let lgi = '';
let leafletMap = null;    // ADD
let leafletMarker = null; // ADD
let mapReady = false;     // ADD  
let osmDisplayName = ''; // stores the Nominatim display_name

async function getmap(lti, lgi, width, height) {
    console.log("[128] getmap - 🗺️ Called with coords:", lti, lgi, "Dimensions:", width, height);

    // Call our Node.js osmApi proxy (consistent with ipgeoApi/dnsRes pattern)
    try {
        const osmUrl = `https://iptracker-api-cdcqaxduasakbjb8.ukwest-01.azurewebsites.net/api/osmApi/${lti}/${lgi}`;
        console.log("[128a] getmap - Fetching OSM data via Node proxy:", osmUrl);
        const osmResponse = await fetch(osmUrl);
        const osmData = await osmResponse.json();
        console.log("[128b] getmap - OSM data received:", JSON.stringify(osmData.display_name));
        // Store display_name globally and update the popup content
        osmDisplayName = osmData.display_name || 'Address not available';
        document.getElementById('osmDisplayName').textContent = osmDisplayName;
    } catch (error) {
        console.warn("[128c] getmap - OSM proxy fetch failed (non-fatal):", error.message);
        // Non-fatal — Leaflet will still render the map from the coords we already have
        osmDisplayName = 'Address not available';
        document.getElementById('osmDisplayName').textContent = osmDisplayName;

    }



    if (mapReady) {
        console.log("[129] getmap - Map already initialized, updating view");
        leafletMap.setView([lti, lgi], 14);
        leafletMarker.setLatLng([lti, lgi]);
        rotateArrow.cancel();
        btnArrHvrStyle();
        console.log("[130] getmap - Map view updated, animation stopped");
        return;
    }

    console.log("[131] getmap - Initializing new map");
    document.getElementById('HereApiMapMble').style.display = 'none';
    document.getElementById('HereApiMapDskt').style.display = 'none';
    document.getElementById('leafletMap').style.display = 'block';
    console.log("[132] getmap - Displaying Leaflet map container");

    // Wrap setTimeout in a Promise so async/await works correctly
    console.log("[133] getmap - Waiting 50ms for DOM update");
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log("[134] getmap - Creating Leaflet map instance");
    leafletMap = L.map('leafletMap', { zoomControl: true }).setView([lti, lgi], 14);

    console.log("[135] getmap - Adding OpenStreetMap tiles");
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletMap);

    console.log("[136] getmap - Creating custom pin icon");
    const pinIcon = L.divIcon({
        className: '',
        html: `<div style="
            width: 36px; height: 36px;
            background: rgb(32,38,50);
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    });

    console.log("[137] getmap - Adding marker to map");
    //leafletMarker = L.marker([lti, lgi], { icon: pinIcon }).addTo(leafletMap);
      leafletMarker = L.marker([lti, lgi]).addTo(leafletMap);

    mapReady = true;
    console.log("[138] getmap - Map initialization complete");
    rotateArrow.cancel();
    btnArrHvrStyle();
    console.log("[139] getmap - Spinning animation stopped, button reset");
}