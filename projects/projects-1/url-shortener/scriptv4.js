window.onresize=()=>{
  document.getElementById('resizeInnerW').textContent=window.innerWidth;
}

// ─── API CONFIG ────────────────────────────────────────────────────────
//const API_BASE_URL = 'http://localhost:7071';
const API_BASE_URL = 'https://go.blazerbits.uk';


// ─── CLIENT TOKEN ─────────────────────────────────────────────────────
const CLIENT_ID_STORAGE_KEY = 'shortly_client_id';
const LINK_EXPIRY_DAYS = 7;
const MAX_ROWS = 7;

function getOrCreateClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (clientId) return clientId;

  clientId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

  localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  console.log('🆕 User token created (permanent):', clientId);
  return clientId;
}

const CLIENT_ID = getOrCreateClientId();

// ─── PER-LINK ENCRYPTION ─────────────────────────────────────────────

class LinkEncryption {
    constructor(linkId, createdAt) {
        this.linkId = linkId;
        this.createdAt = createdAt;
        this.salt = 'link-specific-salt-v1';
    }

    async getLinkEncryptionKey() {
        const encoder = new TextEncoder();
        const data = encoder.encode(this.linkId + this.createdAt + this.salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(hashBuffer);
    }

    async encrypt(text) {
        try {
            const keyData = await this.getLinkEncryptionKey();
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );

            const encryptedArray = new Uint8Array(encrypted);
            const result = new Uint8Array(iv.length + encryptedArray.length);
            result.set(iv, 0);
            result.set(encryptedArray, iv.length);

            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption error for link:', this.linkId, error);
            return text;
        }
    }

    async decrypt(encryptedData) {
        try {
            const keyData = await this.getLinkEncryptionKey();
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            const decoded = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            const iv = decoded.slice(0, 12);
            const encrypted = decoded.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption error for link:', this.linkId, error);
            return encryptedData;
        }
    }
}

// ─── TOKEN MANAGEMENT ──────────────────────────────────────────────────

function checkAndCleanExpiredLinks() {
    console.log('Checking for expired links...');
    const now = new Date();
    const expiryDays = LINK_EXPIRY_DAYS;
    let removedCount = 0;
    let expiredLinks = [];
    
    const keysToRemove = [];
    const decryptPromises = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key && key.slice(0, 14) === 'ct1D1CpyLnkBtn') {
            try {
                let data = JSON.parse(localStorage.getItem(key));
                if (data && data[4] && data[4].createdAt) {
                    const createdDate = new Date(data[4].createdAt);
                    const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24);
                    
                    if (daysOld >= expiryDays) {
                        keysToRemove.push(key);
                        
                        const decryptPromise = decryptLinkData(data).then(decrypted => {
                            expiredLinks.push({
                                key: key,
                                longUrl: decrypted.longUrl,
                                shortUrl: decrypted.shortUrl,
                                createdAt: data[4].createdAt
                            });
                            console.log(`✅ Decrypted expired link: ${key} → ${decrypted.longUrl}`);
                        });
                        decryptPromises.push(decryptPromise);
                        removedCount++;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse link:', key, e);
            }
        }
    }
    
    if (removedCount === 0) {
        console.log('✅ No expired links found');
        return 0;
    }
    
    Promise.all(decryptPromises).then(() => {
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('Removed expired link:', key);
            if (ct1D1CpyLnkBtnMap && ct1D1CpyLnkBtnMap.has(key)) {
                ct1D1CpyLnkBtnMap.delete(key);
            }
            const allClones = document.querySelectorAll('.ct1D1LnksN1Cls');
            for (let clone of allClones) {
                let cloneBtn = clone.querySelector('[id^="ct1D1CpyLnkBtn"]');
                if (cloneBtn && cloneBtn.id === key) {
                    clone.remove();
                    console.log('Removed expired link from DOM:', key);
                    break;
                }
            }
        });
        
        if (expiredLinks.length > 0) {
            console.log(`✅ Removed ${removedCount} expired link(s)`);
            showNotification(`🗑️ ${removedCount} link(s) have expired and been removed.`, 'warning');
            showExpiredArchiveDialog(expiredLinks);
        }
    }).catch(error => {
        console.error('Error during decryption:', error);
    });
    
    return removedCount;
}

function showExpiredArchiveDialog(expiredLinks) {
    const dialog = document.getElementById('archiveDialog');
    if (!dialog) {
        console.warn('Archive dialog not found in DOM');
        return;
    }
    
    const countEl = document.getElementById('archiveCount');
    const messageEl = document.getElementById('archiveMessage');
    const titleEl = document.getElementById('archiveTitle');
    const iconEl = document.getElementById('archiveIcon');
    
    const count = expiredLinks.length;
    iconEl.textContent = count > 1 ? '📋' : '📄';
    titleEl.textContent = count > 1 ? 'Links Expired' : 'Link Expired';
    messageEl.innerHTML = 
        `<strong>${count}</strong> link${count > 1 ? 's' : ''} have expired after ${LINK_EXPIRY_DAYS} days.`;
    countEl.textContent = count > 1 
        ? `Would you like to save them before they're permanently deleted?`
        : `Would you like to save it before it's permanently deleted?`;
    
    dialog.classList.add('active');
    dialog.style.display = 'flex';
    
    document.getElementById('archiveYesBtn').onclick = function() {
        archiveLinks(expiredLinks.map(link => ({
            longUrl: link.longUrl,
            createdAt: link.createdAt
        })));
        dialog.classList.remove('active');
        dialog.style.display = 'none';
        setTimeout(() => location.reload(), 1500);
    };
    
    document.getElementById('archiveNoBtn').onclick = function() {
        dialog.classList.remove('active');
        dialog.style.display = 'none';
        showNotification('Expired links have been discarded.', 'info');
        setTimeout(() => location.reload(), 1500);
    };
}

// ─── DELETE LINK FUNCTION ─────────────────────────────────────────────

async function deleteLink(btnId) {
    console.log(`🗑️ Deleting link: ${btnId}`);
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    // Find the matching clone so we can (a) read its short code and
    // (b) remove it from the DOM once we're done.
    let matchedClone = null;
    const allClones = document.querySelectorAll('.ct1D1LnksN1Cls');
    for (let clone of allClones) {
        let cloneBtn = clone.querySelector('[id^="ct1D1CpyLnkBtn"]');
        if (cloneBtn && cloneBtn.id === btnId) {
            matchedClone = clone;
            break;
        }
    }

    // Pull the short code out of the displayed short URL text
    // (e.g. "https://go.blazerbits.uk/AbC123" -> "AbC123")
    let shortCode = null;
    if (matchedClone) {
        const shortUrlEl = matchedClone.querySelector('[id^="ct1D1ShrtLnkP"]');
        if (shortUrlEl && shortUrlEl.textContent) {
            try {
                shortCode = new URL(shortUrlEl.textContent).pathname.split('/').filter(Boolean).pop();
            } catch (e) {
                console.warn('   ⚠️ Could not parse short code from displayed URL:', shortUrlEl.textContent);
            }
        }
    }

    // Ask the backend to delete the actual record too — best-effort, so a
    // network hiccup here doesn't prevent the user from clearing it locally.
    if (shortCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete`, {
                method: 'POST',
                mode: 'cors',
                signal: AbortSignal.timeout(15000),
                headers: { 'Content-Type': 'text/plain' }, // avoids a CORS preflight, same trick as /shorten
                body: JSON.stringify({ code: shortCode, client_id: CLIENT_ID })
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                console.log(`   ✅ Removed from backend: ${shortCode}`);
            } else {
                console.warn(`   ⚠️ Backend delete failed (${response.status}):`, data?.error);
            }
        } catch (err) {
            console.warn('   ⚠️ Backend delete request failed:', err);
        }
    } else {
        console.warn('   ⚠️ Could not determine short code — skipping backend delete');
    }
    
    // Remove from localStorage
    localStorage.removeItem(btnId);
    console.log(`   ✅ Removed from localStorage: ${btnId}`);
    
    // Remove from the map
    if (ct1D1CpyLnkBtnMap && ct1D1CpyLnkBtnMap.has(btnId)) {
        ct1D1CpyLnkBtnMap.delete(btnId);
        console.log(`   ✅ Removed from map: ${btnId}`);
    }
    
    // Remove from DOM
    if (matchedClone) {
        matchedClone.remove();
        console.log(`   ✅ Removed from DOM: ${btnId}`);
    }
    
    showNotification('🗑️ Link deleted.', 'info');
    console.log(`✅ Link ${btnId} deleted successfully`);
}

// ─── ARCHIVE FUNCTIONS ────────────────────────────────────────────────

function archiveLinks(links) {
  if (!links || links.length === 0) {
    showNotification('No links to archive.', 'info');
    return;
  }
  
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const filename = `shortlyLinks_${dateStr}.txt`;
  
  let content = '=== Shortly URL Shortener - Archived Links ===\n';
  content += `Archive Date: ${now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}\n`;
  content += '='.repeat(50) + '\n\n';
  
  links.forEach((link, index) => {
    const createdDate = new Date(link.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    content += `Link #${index + 1}\n`;
    content += `  URL:  ${link.longUrl}\n`;
    content += `  Created:   ${createdDate}\n`;
    content += `  ${'-'.repeat(40)}\n\n`;
  });
  
  content += '\n' + '='.repeat(50) + '\n';
  content += `Total Links Archived: ${links.length}\n`;
  content += 'Generated by Shortly URL Shortener\n';
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification(`✅ ${links.length} links saved to ${filename}`, 'success');
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const colors = { info: '#2196F3', success: '#2ecc71', error: '#f44336', warning: '#ff9800' };
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: ${colors[type] || colors.info}; color: white;
    padding: 12px 24px; border-radius: 8px; z-index: 9999;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideUp 0.3s ease-out; max-width: 90%; text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.5s';
    setTimeout(() => notif.remove(), 500);
  }, 5000);
}

function initTokenManagement() {
  const clientId = getOrCreateClientId();
  console.log('✅ User token active:', clientId);
  checkAndCleanExpiredLinks();
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAndCleanExpiredLinks();
    }
  });
}

// ─── END OF TOKEN MANAGEMENT ──────────────────────────────────────────

let error = '';
let parentElemct1D1 = document.getElementById("ct1D1");
let ct1D1inp = document.getElementById('ct1D1inp');
let ct1D1Btn = document.getElementById('ct1D1Btn');
let ct1DlongUrlP = document.getElementById("ct1DlongUrlP");
let ct1DshortUrl = '';
let ct1D1CpyLnkBtnId = '';
let ct1D1ShrtLnkPId = '';

let ct1DlongUrl = '';
let oneClickFlag = false;
let iKey = 0;
let maxRows = MAX_ROWS;

const effect = new KeyframeEffect(
    ct1D1Btn,
    [{ transform: 'rotate(0deg) scalex(0.3)' }, { transform: 'rotate(100000deg) scalex(0.0)' }],
    { duration: 15000 }
);
const rotatect1D1Btn = new Animation(effect, document.timeline);

ct1D1Btn.addEventListener("pointerdown", e => {
    console.log('ct1D1Btn Button has been pressed..')
    async function BtnProc() {
        if (ct1D1inp.value) {
            ct1DlongUrl = ct1D1inp.value;
            ct1D1Btn.style.background = 'linear-gradient(0.25turn, #c7a2ff, #502457, #eb88fa)';
            rotatect1D1Btn.play();
            oneClickFlag = false;
            error = '';

            if (!validateUrlLength(ct1DlongUrl)) {
                rotatect1D1Btn.cancel();
                ct1D1Btn.style.background = "";
                alert(error);
                return;
            }
            urlValidator(ct1DlongUrl);
            if (error === '') {
                ct1D1Btn.classList.toggle('noPointerEvnC');
                setTimeout(() => {
                    ct1D1Btn.classList.remove('noPointerEvnC');
                    ct1D1Btn.style.background = '';
                }, 1000);
                ct1DshortUrl = await getShortUrl(ct1DlongUrl);
                if (ct1DshortUrl) {
                    rotatect1D1Btn.cancel();
                    UrlLinkDiv(ct1D1CpyLnkBtnId, ct1D1ShrtLnkPId, ct1DlongUrl, ct1DshortUrl, false);
                } else {
                    rotatect1D1Btn.cancel();
                    console.log('Error fetching url, please check internet connection..:' + error);
                }
            }
        } else {
            console.log('Please add a link..')
            if (!oneClickFlag || ct1DlongUrl == '') {
                resetErrStyles();
                plsAddLnkMsg();
            }
            oneClickFlag = true;
        }
    }
    BtnProc();
})

function plsAddLnkMsg() {
    let childElem = document.getElementById("ct1D1Btn");
    let textnode = document.createTextNode("Please add a link");
    let newPElem = document.createElement("p");
    newPElem.setAttribute('id', 'ct1D1AdLnkMsg');
    newPElem.style.display = "flex";
    newPElem.style.position = "relative";
    newPElem.style.flexDirection = "column";
    newPElem.style.justifyContent = "center";
    newPElem.style.alignItems = "center";
    if (window.innerWidth <= 700) {
        newPElem.style.marginLeft = "-140px";
        newPElem.style.marginTop = "-10px";
        newPElem.style.color = "rgba(255, 0, 0, 0.500)";
    } else {
        newPElem.style.position = "absolute";
        newPElem.style.marginLeft = "-70%";
        newPElem.style.marginTop = "10vh";
        newPElem.style.color = "rgba(255, 102, 102, 0.619)";
    }
    newPElem.style.fontsize = "12px";
    newPElem.style.fontStyle = "italic";
    newPElem.appendChild(textnode);
    parentElemct1D1.insertBefore(newPElem, childElem);
    ct1D1inp.classList.toggle('warn');
    ct1D1inp.style.border = "inset 3px rgba(255, 0, 0, 0.500)";
    if (window.innerWidth <= 700) {
        parentElemct1D1.style.height = "182px";
        ct1D1Btn.style.top = "110px"
    }
}

function resetErrStyles() {
    let ct1D1AdLnkMsg = document.getElementById('ct1D1AdLnkMsg');
    if (ct1D1AdLnkMsg !== null) { ct1D1AdLnkMsg.remove(); }
    ct1D1inp.classList.remove('warn');
    ct1D1inp.style.border = "unset";
    console.log('window.innerWidth :' + window.innerWidth);
    if (window.innerWidth <= 700) {
        parentElemct1D1.style.height = "160px";
        ct1D1Btn.style.top = "86px"
    }
}

ct1D1inp.oninput = function() {
    if (ct1D1inp.value === ct1D1inp.value[0]) {
        resetErrStyles();
    }
};
ct1D1inp.onpaste = function() {
    resetErrStyles();
};

async function getShortUrl(ct1DlongUrl) {
    try {
        const response = await fetch(`${API_BASE_URL}/shorten`, {
            method: 'POST',
            mode: 'cors',
            signal: AbortSignal.timeout(15000),
            // text/plain avoids a CORS preflight (it's a "safelisted" content-type);
            // the payload is still JSON, just parsed server-side instead of via
            // the Content-Type header. client_id moved into the body so we don't
            // need a custom header either — Azure's built-in preflight handling
            // can't cope with custom headers, so we sidestep it entirely.
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ url: ct1DlongUrl, client_id: CLIENT_ID })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.error || `Request failed (${response.status})`);
        }
        return data.shortUrl;
    } catch (err) {
        error = err;
        console.error('Error fetching url:' + err);
        alert('Please Check internet connection, error fetching url:' + err);
    }
}

async function urlValidator(ct1DlongUrl) {
    let errMsg = "Invalid Url..." + "\n" + "\
    -:  " + ct1DlongUrl + "\n" + "\ ";
    try {
        new URL(ct1DlongUrl);
        return true;
    } catch (err) {
        rotatect1D1Btn.cancel();
        ct1D1Btn.style.background = ""
        error = err;
        alert(errMsg + err);
        return false;
    }
}

function validateUrlLength(url, maxLength = 700) {
    if (url.length > maxLength) {
        error = `URL is too long. Maximum ${maxLength} characters allowed. Current length: ${url.length}`;
        return false;
    }
    return true;
}

let numChd = document.getElementById("ct1D").childElementCount;
let ct1D1LnksN1 = document.getElementById("ct1D1LnksN1");
let ct1Dsep = document.getElementById('ct1Dsep');
let ct1D1ShrtLnkP = document.getElementById('ct1D1ShrtLnkP');
let ct1D1CpyLnkBtn = document.getElementById('ct1D1CpyLnkBtn');
let ct1DinitHt = document.getElementById('ct1D').clientHeight;
let ct1D1CpyLnkBtnMap = new Map();

let ctjnrD3D4 = document.getElementById('ctjoinerD3D4');
ctjnrD3D4.style.top = (512 + "px");
let ctjnrD4D5 = document.getElementById('ctjoinerD4D5');
ctjnrD4D5.style.top = (550 + "px");

// ─── PER-LINK ENCRYPTION STORAGE ──────────────────────────────────────

async function encryptAndStoreLink(btnId, shortId, longUrl, shortUrl) {
    const createdAt = new Date().toISOString();
    const linkId = btnId;
    const linkEncrypt = new LinkEncryption(linkId, createdAt);
    
    try {
        const encryptedLong = await linkEncrypt.encrypt(longUrl);
        const encryptedShort = await linkEncrypt.encrypt(shortUrl);
        
        return [
            { 'ct1D1CpyLnkBtnId': btnId },
            { 'ct1D1ShrtLnkPId': shortId },
            { 'ct1DlongUrl': encryptedLong },
            { 'ct1DshortUrl': encryptedShort },
            { 'createdAt': createdAt },
            { 'linkId': linkId }
        ];
    } catch (error) {
        console.error('Encryption failed, storing plain text:', error);
        return [
            { 'ct1D1CpyLnkBtnId': btnId },
            { 'ct1D1ShrtLnkPId': shortId },
            { 'ct1DlongUrl': longUrl },
            { 'ct1DshortUrl': shortUrl },
            { 'createdAt': createdAt },
            { 'linkId': linkId }
        ];
    }
}

async function decryptLinkData(linkData) {
    const linkId = linkData[5]?.linkId || linkData[0].ct1D1CpyLnkBtnId;
    const createdAt = linkData[4]?.createdAt || new Date().toISOString();
    const longUrl = linkData[2].ct1DlongUrl;
    const shortUrl = linkData[3].ct1DshortUrl;
    
    const isEncrypted = longUrl.length > 50 || longUrl.includes('=');
    
    if (isEncrypted) {
        try {
            const linkEncrypt = new LinkEncryption(linkId, createdAt);
            const decryptedLong = await linkEncrypt.decrypt(longUrl);
            const decryptedShort = await linkEncrypt.decrypt(shortUrl);
            return {
                longUrl: decryptedLong,
                shortUrl: decryptedShort
            };
        } catch (error) {
            console.warn('Decryption failed for link:', linkId, error);
        }
    }
    return { longUrl, shortUrl };
}

// ─── URL LINK DIV ──────────────────────────────────────────────────────

function UrlLinkDiv(ct1D1CpyLnkBtnId, ct1D1ShrtLnkPId, ct1DlongUrl, ct1DshortUrl, isLoading) {
    if (typeof isLoading === 'undefined') {
        isLoading = false;
    }
    
    let parentElemct1D = document.getElementById("ct1D");
    let childElem = document.getElementById("ct1D2");
    let allClones = document.querySelectorAll('.ct1D1LnksN1Cls');
    let cloneCount = allClones.length;

    if (!isLoading) {
        let linkCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key != null && key.slice(0, 14) === 'ct1D1CpyLnkBtn') {
                linkCount++;
            }
        }
        
        if (linkCount >= maxRows) {
            let oldestKey = null;
            let oldestTimestamp = null;
            let oldestElement = null;
            
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key != null && key.slice(0, 14) === 'ct1D1CpyLnkBtn') {
                    try {
                        let data = JSON.parse(localStorage.getItem(key));
                        if (data && data[4] && data[4].createdAt) {
                            let timestamp = new Date(data[4].createdAt);
                            if (!oldestTimestamp || timestamp < oldestTimestamp) {
                                oldestTimestamp = timestamp;
                                oldestKey = key;
                            }
                        }
                    } catch (e) {}
                }
            }
            
            if (oldestKey) {
                let data = JSON.parse(localStorage.getItem(oldestKey));
                let btnId = data[0].ct1D1CpyLnkBtnId;
                let allClonesList = document.querySelectorAll('.ct1D1LnksN1Cls');
                for (let clone of allClonesList) {
                    let cloneBtn = clone.querySelector('[id^="ct1D1CpyLnkBtn"]');
                    if (cloneBtn && cloneBtn.id === btnId) {
                        oldestElement = clone;
                        break;
                    }
                }
                if (oldestElement) {
                    ct1D1CpyLnkBtnMap.delete(btnId);
                    oldestElement.remove();
                    localStorage.removeItem(oldestKey);
                    console.log('Removed oldest link from DOM and localStorage:', oldestKey);
                }
            }
        }
    }

    ct1DlongUrlP.textContent = ct1DlongUrl;
    ct1D1ShrtLnkP.textContent = ct1DshortUrl;

    let ct1D1LnksN1Clnd = ct1D1LnksN1.cloneNode('true');
    let cloneBtn = ct1D1LnksN1Clnd.querySelector('[id^="ct1D1CpyLnkBtn"]');
    let cloneShortUrl = ct1D1LnksN1Clnd.querySelector('[id^="ct1D1ShrtLnkP"]');

    let actualBtnId = ct1D1CpyLnkBtnId;
    let actualShortId = ct1D1ShrtLnkPId;

    if (isLoading) {
        if (cloneBtn) cloneBtn.id = ct1D1CpyLnkBtnId;
        if (cloneShortUrl) cloneShortUrl.id = ct1D1ShrtLnkPId;
        let cloneLongUrl = ct1D1LnksN1Clnd.querySelector('[id^="ct1DlongUrlP"]');
        if (cloneLongUrl) cloneLongUrl.id = 'ct1DlongUrlP' + (iKey);
        if (cloneBtn && cloneShortUrl) {
            ct1D1CpyLnkBtnMap.set(cloneBtn.id, cloneShortUrl.textContent);
        }
    } else {
        let newBtnId = 'ct1D1CpyLnkBtn' + iKey;
        let newShortId = 'ct1D1ShrtLnkP' + iKey;
        let newLongId = 'ct1DlongUrlP' + iKey;
        let newSepId = 'ct1Dsep' + iKey;

        if (cloneBtn) cloneBtn.id = newBtnId;
        if (cloneShortUrl) cloneShortUrl.id = newShortId;
        let cloneLongUrl = ct1D1LnksN1Clnd.querySelector('[id^="ct1DlongUrlP"]');
        let cloneSep = ct1D1LnksN1Clnd.querySelector('[id^="ct1Dsep"]');
        if (cloneLongUrl) cloneLongUrl.id = newLongId;
        if (cloneSep) cloneSep.id = newSepId;

        ct1D1LnksN1.id = 'ct1D1LnksN1' + iKey;
        ct1Dsep.id = 'ct1Dsep' + iKey;
        ct1DlongUrlP.id = 'ct1DlongUrlP' + iKey;
        ct1D1ShrtLnkP.id = 'ct1D1ShrtLnkP' + iKey;
        ct1D1CpyLnkBtn.id = 'ct1D1CpyLnkBtn' + iKey;

        actualBtnId = newBtnId;
        actualShortId = newShortId;

        if (cloneBtn && cloneShortUrl) {
            ct1D1CpyLnkBtnMap.set(cloneBtn.id, cloneShortUrl.textContent);
        }
        ct1D1LnksN1Clnd.id = 'ct1D1LsN1Cld' + iKey;
    }

    ct1D1LnksN1Clnd.classList.add('ct1D1LnksN1Cls');
    ct1D1LnksN1.after(ct1D1LnksN1Clnd);
    ct1D1LnksN1Clnd.style.display = "flex";

    if (window.innerWidth <= 700) {
        if ((parentElemct1D.clientHeight) < ((ct1DinitHt) + (maxRows * 190))) {
            let parElClntHt = (parentElemct1D.clientHeight + 190);
            parentElemct1D.style.height = (parElClntHt + "px");
        }
    } else {
        if (numChd <= (7 + maxRows)) {
            let ctjnrD3D4Tp = Number((ctjnrD3D4.style.top).slice(0, -2));
            ctjnrD3D4.style.top = ((ctjnrD3D4Tp + 88) + "px");
            let ctjnrD4D5Tp = Number((ctjnrD4D5.style.top).slice(0, -2));
            ctjnrD4D5.style.top = ((ctjnrD4D5Tp + 88) + "px");
        }
    }

    let ct1D1Element = document.getElementById('ct1D1');
    ct1D1Element.after(ct1D1LnksN1Clnd);
    ct1D1LnksN1Clnd.focus();

    if (!isLoading) {
        encryptAndStoreLink(actualBtnId, actualShortId, ct1DlongUrl, ct1DshortUrl).then(cloneLinkData => {
            onWriteLclStrg(actualBtnId, actualShortId, cloneLinkData);
        });
        iKey++;
    }
}

addGlobalEventListener('click', 'button', e => {
    // ─── COPY BUTTON ──────────────────────────────────────────────
    if (e.target.id && e.target.id.slice(0, 14) === 'ct1D1CpyLnkBtn' && !e.target.id.includes('Delete')) {
        let shortUrl = ct1D1CpyLnkBtnMap.get(e.target.id);
        if (shortUrl) {
            let elem = document.getElementById(e.target.id);
            const effect2 = new KeyframeEffect(
                elem,
                [{ transform: 'scalex(0.5)' }, { transform: 'scalex(0.2)' }],
                { duration: 250 }
            );
            const AnimcpyBtn = new Animation(effect2, document.timeline);
            AnimcpyBtn.play();

            const copyText = async () => {
                try {
                    await navigator.clipboard.writeText(shortUrl);
                    console.log('Short link copied to clipboard ok..:' + shortUrl);
                } catch (error) {
                    console.log('Copy failed..:' + error.message);
                    alert('Copy failed: timed out, please try again.:' + error.message);
                }
            };
            copyText();
            e.target.style.background = "linear-gradient(rgb(41, 33, 63),rgb(78, 61, 122))";
            e.target.textContent = "Copied!";
        }
    }
    
    // ─── DELETE BUTTON ─────────────────────────────────────────────
    if (e.target.id && e.target.id.includes('Delete')) {
        const clone = e.target.closest('.ct1D1LnksN1Cls');
        if (clone) {
            const copyBtn = clone.querySelector('[id^="ct1D1CpyLnkBtn"]:not([id*="Delete"])');
            if (copyBtn) {
                deleteLink(copyBtn.id);
            }
        }
        return;
    }
    
    // ─── RESET COPY BUTTONS ────────────────────────────────────────
    for (let [btnId, url] of ct1D1CpyLnkBtnMap) {
        if (btnId !== e.target.id) {
            let lnkBtnElem = document.getElementById(btnId);
            if (lnkBtnElem) {
                lnkBtnElem.style.background = "";
                lnkBtnElem.textContent = "Copy";
            }
        }
    }
});

function addGlobalEventListener(type, selector, callback) {
    document.addEventListener(type, e => {
        if (e.target.matches(selector)) {
            callback(e);
        }
    })
};

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log('visibilitychange visibilityState changed to visible 1..');
        ct1Cbtn.click();
    }
});

function onWriteLclStrg(ct1D1CpyLnkBtnId, ct1D1ShrtLnkPId, cloneLinkData) {
    localStorage.setItem(ct1D1CpyLnkBtnId, JSON.stringify(cloneLinkData));
    console.log('Stored link:', ct1D1CpyLnkBtnId);
}

async function wakeupAPIsite() {
    try {
        await fetch(`${API_BASE_URL}/health`, {
            signal: AbortSignal.timeout(20000),
            mode: 'cors'
        });
    } catch (err) {
        console.warn('API warm-up ping failed (non-critical):', err);
    }
}

function OnLoadLclStrg() {
    console.log("OnLoadLclStrg function..");
    
    const existingClones = document.querySelectorAll('.ct1D1LnksN1Cls');
    existingClones.forEach(clone => clone.remove());
    
    ct1D1CpyLnkBtnMap.clear();
    
    checkAndCleanExpiredLinks();
    
    let allLinks = [];
    let maxKeyNumber = 0;
    const now = new Date();
    const expiryDays = LINK_EXPIRY_DAYS;

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key != null && key.slice(0, 14) === 'ct1D1CpyLnkBtn') {
            let keyV = localStorage.getItem(key);
            try {
                let LSkey = JSON.parse(keyV);
                if (LSkey && LSkey[0] && LSkey[0].ct1D1CpyLnkBtnId) {
                    if (LSkey[4] && LSkey[4].createdAt) {
                        const createdDate = new Date(LSkey[4].createdAt);
                        const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24);
                        if (daysOld >= expiryDays) {
                            console.log('Skipping expired link:', key);
                            localStorage.removeItem(key);
                            continue;
                        }
                    }
                    
                    let num = parseInt(key.replace('ct1D1CpyLnkBtn', '')) || 0;
                    allLinks.push({
                        key: key,
                        data: LSkey,
                        num: num,
                        timestamp: LSkey[4]?.createdAt || null,
                        btnId: LSkey[0].ct1D1CpyLnkBtnId,
                        shortId: LSkey[1].ct1D1ShrtLnkPId
                    });
                    if (num > maxKeyNumber) maxKeyNumber = num;
                }
            } catch (e) {
                console.warn('Failed to parse localStorage key:', key, e);
            }
        }
    }

    console.log('Found ' + allLinks.length + ' links in localStorage');

    allLinks.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    console.log('Link order after sorting (newest first):');
    allLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.data[2].ct1DlongUrl} (created: ${link.timestamp})`);
    });

    if (allLinks.length > maxRows) {
        allLinks = allLinks.slice(0, maxRows);
        console.log('Limited to ' + maxRows + ' links');
    }

    for (let i = allLinks.length - 1; i >= 0; i--) {
        let link = allLinks[i];
        decryptLinkData(link.data).then(decrypted => {
            link.data[2].ct1DlongUrl = decrypted.longUrl;
            link.data[3].ct1DshortUrl = decrypted.shortUrl;
            
            UrlLinkDiv(
                link.btnId,
                link.shortId,
                link.data[2].ct1DlongUrl,
                link.data[3].ct1DshortUrl,
                true
            );
        });
    }

    setTimeout(() => {
        if (maxKeyNumber > 0) {
            iKey = maxKeyNumber + 1;
        } else {
            iKey = 1;
        }
        console.log('iKey set to:', iKey);
        wakeupAPIsite();
    }, 100);
}

// ─── INITIALIZATION ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    initTokenManagement();
    OnLoadLclStrg();
});