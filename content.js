// -------- utils -------- //

/**
 * restrict a number to a certain boundary
 * 
 * @param {number} num number you want to restrict
 * @param {number} min lowest int num can be
 * @param {number} max highest int num can be
 * 
 * @return {number} num restricted on {min...max}
 */
clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
}

// -------- globals -------- //

// dev (access different functions)
const dev = false;

// url with video/media in it
const mediaUrlRegex = RegExp('^https://play.hbonow.com/(feature|episode|extra)/.+$');

// elements
let barElement   = null; // grey bars element
let videoElement = null; // video element
let mediaElement = null; // media toolbar element

// search
let searching      = true;
let searchInterval = null;

// -------- listening for changes -------- //

onChange = () => {
    let url = window.location.href;
    if (mediaUrlRegex.test(url)) {
        restartSearchInterval();
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'url-change') {
        if (dev) console.log('urlChange');
        onChange();
    }
});

// -------- search for elements -------- //

resetSearch = () => {
    clearInterval(searchInterval);
    searching = true;
    barElement = null;
    videoElement = null;
    mediaElement = null;
}

allElementsFound = () => {
    const mediaFound = !dev || mediaElement;
    return barElement && videoElement && mediaFound;
}

stopSearch = () => {
    clearInterval(searchInterval);
    searching = false;
}

restartSearchInterval = () => {
    resetSearch();
    searchInterval = setInterval(() => {
        if (dev) console.log('searching...');

        // GREY BARS ELEMENT
        if (!barElement) {
            barElement = [...document.getElementsByClassName('default')].find(el => {
                return el.style['backgroundColor'] === 'rgb(15, 15, 15)';
            });
            toggleBars(true);
        }

        // VIDEO ELEMENT
        if (!videoElement) {
            const videoElements = document.getElementsByTagName('video');
            if (videoElements.length === 1) videoElement = videoElements[0];
            else if (videoElements.length > 1) {
                console.error('Error: More than one video element in current DOM.');
            }
        }

        // MEDIA TOOLBAR ELEMENT
        if (dev && !mediaElement) {
            mediaElement = [...document.getElementsByClassName('default')].find(el => {
                return el.style['backgroundColor'] === 'rgba(15, 15, 15, 0.76)'; // theres more than 1 with this bc
            });
        }

        if (allElementsFound()) {
            if (dev) {
                console.log('barElement', barElement);
                console.log('videoElement', videoElement);
                console.log('mediaElement', mediaElement);
            }
            stopSearch();
        }

    }, 500);
}

// -------- key events -------- //

document.onkeydown = e => {
    const key = e.keyCode;
    if (dev) console.log('key', key);
    switch (key) {
        case 32: // space
            if (videoElement) e.preventDefault();
            break;
        case 37: // <-
            skip(-10);
            break;
        case 39: // ->
            skip(10);
            break;
        case 38: // up
            if (dev) alterVolume(e, 0.1);
            break;
        case 40: // down
            if (dev) alterVolume(e, -0.1);
            break;
        case 77: // m
            if (dev) toggleBars();
            break;
        case 78: // n
            if (dev) toggleMedia();
            break;
        default:
            break;
    }
}

skip = (amt) => {
    if (videoElement) {
        const newTime = videoElement.currentTime + amt;
        videoElement.currentTime = clamp(newTime, 0, videoElement.duration);
    }
}

alterVolume = (e, amt) => {
    // changing this doesn't reflect what's displayed on screen!!
    if (videoElement) {
        e.preventDefault();
        const newVolume = videoElement.volume + amt;
        videoElement.volume = clamp(newVolume, 0, 1);
    }
}

toggleBars = (forceBlack) => {
    if (barElement) {
        if (forceBlack || barElement.style['backgroundColor'] === 'rgb(15, 15, 15)') {
            barElement.style['backgroundColor'] = 'rgb(0, 0, 0)';
        } else {
            barElement.style['backgroundColor'] = 'rgb(15, 15, 15)';
        }
    }
}

toggleMedia = () => {
    if (mediaElement && mediaElement.parentElement) {
        const curDisplay = mediaElement.parentElement.style['display'];
        if (curDisplay === 'none') mediaElement.parentElement.style['display'] = '';
        else mediaElement.parentElement.style['display'] = 'none';
    }
}

// -------- start -------- //

onChange();
