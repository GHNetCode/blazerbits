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
let HereApiMap=document.getElementById('HereApiMap');// ISP ...


let dnsResUrl = 'http://127.0.0.1/dnsRes/' // used for finding Information for ip address`s and Domain names entered..
                                           // this is the domain name of where the nodejs instance is running.  -old location (https://njsar.glitch.me)
                                           // for local testing use http://127.0.0.1 for all locations in this file,  if nodejs is running locally..
let dnsResUrlget=''; //set flag 'dnsResUrlget' to call dnsRes to convert Domain name to Ip...

let getJsndnsRes = async dnsResUrl => { 
  try {
    let response = await fetch(dnsResUrl);
    let dnsResdata = await response.json(); // get JSON from the response
    return dnsResdata; // This async function returns a promise which resolves to this data value..
  } catch (error){
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
  sBRCiPaDD.innerHTML=('127.0.0.1'); //IP ADDRESS
  sBRCLoc.innerText=('City,Country'); // LOCATION
  document.getElementById('sBRCLoc').appendChild(sBRCLocFlag);// previous line 'sBRCLoc.innerText=..' overwrites the inner img tag, so it needs adding again..
  //sBRCLocFlag.src=('./images/icon-arrow.svg'); // LOCATION FLAG
  sBRCLocFlag.src=('./images/WhiteFlag.png'); // LOCATION FLAG
  sBRCtimeZ.innerHTML=("UTC - 00:00 (Local Time)");// --TIMEZONE--<<
  sBRCiSP.innerHTML=("Internet Service Provider");

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
    //  btnArrHvrMASK.style.zIndex = "2";//Bring Mask Forwards with z-index 2, to protect button for x amount of time..
    //  btnArrHvrMASK.style.background="linear-gradient(#0000008b,#33016480)";
      btnArrHvrMASK.style.zIndex = "unset";
      btnArrHvrMASK.style.background = "unset";
      btnArrHvr.style.display = "unset";
    };

// ========== DOMAIN VALIDATOR CLASS ==========
class DomainValidator {
  constructor() {
    this.validTLDs = [];
    this.lastFetchTime = null;
    this.cacheDuration = 24 * 60 * 60 * 1000;
  }
  
  async fetchValidTLDs() {
    try {
      if (this.validTLDs.length > 0 && this.lastFetchTime) {
        const now = Date.now();
        if (now - this.lastFetchTime < this.cacheDuration) {
          return this.validTLDs;
        }
      }
      
      const response = await fetch('https://data.iana.org/TLD/tlds-alpha-by-domain.txt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      this.validTLDs = text
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line && !line.startsWith('#'));
      
      this.lastFetchTime = Date.now();
      console.log(`✅ Successfully fetched ${this.validTLDs.length} TLDs from IANA`);
      return this.validTLDs;
    } catch (error) {
      console.error('⚠️ Failed to fetch TLD list from IANA:', error.message);
      if (this.validTLDs.length === 0) {
        console.log('📋 Using fallback TLD list');
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
      }
      return this.validTLDs;
    }
  }
  
  async isDomainValid(domain) {
    if (!domain || typeof domain !== 'string') {
      console.log("❌ Invalid input: domain must be a string");
      return false;
    }
    
    domain = domain.trim();
    
    if (domain.length === 0) {
      console.log("❌ Empty domain");
      return false;
    }
    
    if (domain.length > 253) {
      console.log(`❌ Domain too long (${domain.length} chars, max 253)`);
      return false;
    }
    
    if (!domain.includes('.')) {
      console.log("❌ No dot found in domain");
      return false;
    }
    
    const parts = domain.split('.');
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.length < 1 || part.length > 63) {
        console.log(`❌ Invalid part length: '${part}' (${part.length} chars, must be 1-63)`);
        return false;
      }
      
      if (!/^[a-zA-Z0-9]/.test(part)) {
        console.log(`❌ Part '${part}' doesn't start with alphanumeric`);
        return false;
      }
      
      if (!/[a-zA-Z0-9]$/.test(part)) {
        console.log(`❌ Part '${part}' doesn't end with alphanumeric`);
        return false;
      }
      
      if (!/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(part)) {
        console.log(`❌ Part '${part}' has invalid characters or consecutive hyphens`);
        return false;
      }
    }
    
    if (domain.includes('..')) {
      console.log("❌ Consecutive dots not allowed");
      return false;
    }
    
    const tld = parts[parts.length - 1].toLowerCase();
    
    if (!/^[a-zA-Z]+$/.test(tld)) {
      console.log(`❌ TLD '${tld}' contains non-alphabetic characters`);
      return false;
    }
    
    if (tld.length < 2) {
      console.log(`❌ TLD '${tld}' is too short (min 2 characters)`);
      return false;
    }
    
    const validTLDs = await this.fetchValidTLDs();
    
    if (!validTLDs.includes(tld)) {
      console.log(`❌ Invalid TLD: '${tld}' (not in IANA list)`);
      return false;
    }
    
    console.log(`✅ Domain '${domain}' is valid`);
    return true;
  }
  
  getTLDCount() {
    return this.validTLDs.length;
  }
}
// ========== END DOMAIN VALIDATOR CLASS ==========

// Create a single instance of the validator
const domainValidator = new DomainValidator();

// ========== UPDATED BUTTON EVENT LISTENER ==========
btnArrHvr.addEventListener("pointerdown", async function(e) {
  
  btnArrHvrMASK.style.zIndex = "2";
  btnArrHvrMASK.style.background = "linear-gradient(#0000008b,#33016480)";
  
  rotateArrow.play();
  
  console.log("button pushed..");
  htmlEreset();
  
  url = '';
  let srchInpTxtcleaned = '';
  inpTxtHasIp = false;
  inpTxtHasDom = false;
  let dnsResUrlget = ''; // Local variable to avoid conflicts
  
  // If search field is empty - get current IP
  if (srchInpTxt.value === "") {
    url = 'http://127.0.0.1/ipgeoApi/';
    console.log(url);
    errMsgSite = url;
    await getJSONurlFwrapr(); // Wait for the IP lookup
    return;
  }
  
  console.log("Tracker 2");
  
  // Clean up the string
  srchInpTxtcleaned = srchInpTxt.value.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
  srchInpTxtcleaned = srchInpTxtcleaned.split(' ').join('');
  console.log("srchInpTxt.value cleaned..: '"+srchInpTxtcleaned+"'");
  
  let chkDomIpvalid = srchInpTxtcleaned.split(".");
  
  // Check if it's a domain (less than 4 parts)
  if (chkDomIpvalid.length > 0 && chkDomIpvalid.length < 4) {
    console.log("Validate domain name further..");
    
    // AWAIT the domain validation
    const isValidDomain = await domainValidator.isDomainValid(srchInpTxtcleaned);
    
    if (isValidDomain) {
      console.log("Domain Valid, lookup domain..:" + srchInpTxtcleaned);
      dnsResUrlget = dnsResUrl + srchInpTxtcleaned;
      console.log("dnsResUrl -----:" + dnsResUrlget);
      inpTxtHasDom = true;
      
      // Now do the DNS lookup
      console.log("Proceeding with DNS lookup for:", dnsResUrlget);
      rotateArrow.play();
      
      try {
        const dnsdata = await getJsndnsRes(dnsResUrlget);
        
        if (dnsdata) {
          console.log("We have some dnsdata!");
          console.log("dnsdata type:", Array.isArray(dnsdata) ? 'Array' : typeof dnsdata);
          console.log("dnsdata:", JSON.stringify(dnsdata));
          
          // ========== FIX: Check for error object (has 'code' property) ==========
          if (dnsdata.code) {
            // Handle DNS error
            btnArrHvrStyle();
            rotateArrow.cancel();
            console.log("DNS error:", JSON.stringify(dnsdata));
            
            // Display user-friendly error message
            let errorMessage = '';
            if (dnsdata.code === 'ENOTFOUND') {
              errorMessage = "Domain '" + dnsdata.hostname + "' could not be found. The domain may not exist or DNS resolution failed.";
            } else if (dnsdata.code === 'ETIMEOUT') {
              errorMessage = "DNS lookup timed out for '" + dnsdata.hostname + "'. Please try again.";
            } else {
              errorMessage = "DNS error: " + dnsdata.code + " - " + dnsdata.hostname;
            }
            
            alert(errorMessage);
            return; // Exit early
          }
          
          // ========== FIX: Check if we have an array of IP addresses ==========
          if (Array.isArray(dnsdata) && dnsdata.length > 0) {
            console.log("We have dnsdata array with", dnsdata.length, "IPs");
            
            // Check if we have at least one IP
            if (dnsdata[0]) {
              // IP exists, use the first one in the list by default
              let ipLstArr = [];
              for (let i = 0; i < dnsdata.length; i++) {
                ipLstArr.push(dnsdata[i]);
                console.log(i + 1 + " - " + ipLstArr[i]);
              }
              
              // If more than one IP, show list
              if (dnsdata.length > 1) {
                let alertmsg = "A list of IP addresses have been found for the domain '" + srchInpTxtcleaned + "', using the first IP as the location:\n" + ipLstArr.join('\n') + "\nList can be copied to clipboard using Ctrl+C";
                prompt(alertmsg, ipLstArr.join('\n'));
              }
              
              console.log("Tracker 6");
              inpTxtHasIp = true;
              url = 'http://127.0.0.1/ipgeoApi/' + dnsdata[0];
              console.log("Using IP for location:", dnsdata[0]);
              console.log("Full URL:", url);
              
              // Now get the geolocation data for this IP
              await getJSONurlFwrapr();
              dnsResUrlget = "";
              
            } else {
              rotateArrow.cancel();
              btnArrHvrStyle();
              alert("No IP address exists for domain: " + srchInpTxtcleaned);
              return;
            }
          } else {
            // ========== FIX: Unexpected response format ==========
            console.log("Unexpected dnsdata format:", dnsdata);
            rotateArrow.cancel();
            btnArrHvrStyle();
            alert("Unexpected response from DNS lookup. Please try again.");
            return;
          }
        }
      } catch (error) {
        rotateArrow.cancel();
        btnArrHvrStyle();
        console.error("Error fetching DNS data:", error);
        alert("Error fetching DNS data for '" + srchInpTxtcleaned + "'. Please check the internet connection.");
        return;
      }
      
    } else {
      console.log("Invalid domain name entered..:" + srchInpTxtcleaned);
      inpTxtHasDom = false;
      alert('Invalid domain name entered: ' + srchInpTxtcleaned);
      btnArrHvrStyle();
      rotateArrow.cancel();
      return;
    }
    
  } else if (chkDomIpvalid.length === 4) {
    // Check if it's a valid IP address
    const isValidIp = value => (/^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(value));
    if (isValidIp(srchInpTxtcleaned)) {
      inpTxtHasIp = true;
      url = 'http://127.0.0.1/ipgeoApi/' + srchInpTxtcleaned;
      console.log("Valid IP address:", srchInpTxtcleaned);
      await getJSONurlFwrapr();
    } else {
      rotateArrow.cancel();
      btnArrHvrStyle();
      console.log('Invalid IP:', srchInpTxtcleaned);
      alert(srchInpTxtcleaned + " is not a valid IP address. Please enter a correct IP Address.");
      return;
    }
  }
  
}); // End Button function

// ========== UPDATED getJSONurlFwrapr FUNCTION ==========
async function getJSONurlFwrapr() {
  console.log("getJSONurlFwrapr called with url:", url);
  
  // Define getJSON function
  const getJSON = async url => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Added 'await' here
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  if (srchInpTxt.value === "" || inpTxtHasIp) {
    console.log("Tracker 8");
    rotateArrow.play();
    let getUserIPChk = false;
    
    async function getUserIP() {
      if (srchInpTxt.value === "" && inpTxtHasIp === false) {
        errMsgSite = "https://api.bigdatacloud.net/data/client-ip";
        
        try {
          const response = await fetch('https://api.bigdatacloud.net/data/client-ip', { signal: AbortSignal.timeout(5000) });
          if (response.ok) {
            const respData = await response.json();
            console.log('respData:', JSON.stringify(respData));
            console.log('User IP Address:', respData.ipString);
            url = url + respData.ipString;
            getUserIPChk = true;
          } else {
            throw new Error('Something went wrong');
          }
        } catch (error) {
          setTimeout(rotateArrow.cancel, 500);
          console.log('Error getting user IP:', error);
          btnArrHvrStyle();
          alert("Could not retrieve your IP address. Please check your internet connection.");
        }
      }
    }
    
    await getUserIP();
    console.log("Tracker 11");
    console.log('srchInpTxt.value:', srchInpTxt.value);
    console.log("inpTxtHasIp:", inpTxtHasIp);
    console.log('url:', url);
    console.log('getUserIPChk:', getUserIPChk);
    
    if (getUserIPChk || inpTxtHasIp) {
      try {
        const data = await getJSON(url);
        if (data) {
          if (data.message) {
            rotateArrow.cancel();
            btnArrHvrStyle();
            console.log("Data error message:", JSON.stringify(data));
            alert("Data error message: " + JSON.stringify(data));
          } else {
            console.log(data.ip);
            sBRCiPaDD.innerHTML = data.ip;
            sBRCLoc.innerText = (data.city + "," + data.country_code3 + " " + data.zipcode + " ");
            document.getElementById('sBRCLoc').appendChild(sBRCLocFlag);
            sBRCLocFlag.src = (data.country_flag);
            let HHMM = String(data.time_zone.current_time).slice(11, 16);
            sBRCtimeZ.innerHTML = (HHMM + " (Local Time)");
            sBRCiSP.innerHTML = data.isp;
            
            let width = '', height = '';
            if (window.innerWidth > '700') {
              width = '1440';
              height = '522';
            } else {
              width = '375';
              height = '530';
            }
            
            getmap(data.latitude, data.longitude, width, height);
          }
        } else {
          console.log("Error: Invalid data returned.");
          alert("Error: Invalid data returned.");
          rotateArrow.cancel();
          btnArrHvrStyle();
        }
      } catch (error) {
        rotateArrow.cancel();
        btnArrHvrStyle();
        htmlEreset();
        alert("Unable to reach the site: " + errMsgSite + " Please check internet connection.");
        console.error("Unable to reach the site:", errMsgSite);
        console.error(error);
      }
    }
  }
}
// ========== END getJSONurlFwrapr FUNCTION ==========



//global variables - OpenStreetMaps..
let lti = '';
let lgi = '';
let leafletMap = null;    // ADD
let leafletMarker = null; // ADD
let mapReady = false;     // ADD  
async function getmap(lti, lgi, width, height) {
    if (mapReady) {
        leafletMap.setView([lti, lgi], 14);
        leafletMarker.setLatLng([lti, lgi]);
        rotateArrow.cancel();
        btnArrHvrStyle();
        return;
    }

    document.getElementById('HereApiMapMble').style.display = 'none';
    document.getElementById('HereApiMapDskt').style.display = 'none';
    document.getElementById('leafletMap').style.display = 'block';

    // Wrap setTimeout in a Promise so async/await works correctly
    await new Promise(resolve => setTimeout(resolve, 50));

    leafletMap = L.map('leafletMap', { zoomControl: true }).setView([lti, lgi], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(leafletMap);

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

    leafletMarker = L.marker([lti, lgi], { icon: pinIcon }).addTo(leafletMap);

    mapReady = true;
    rotateArrow.cancel();
    btnArrHvrStyle();
}