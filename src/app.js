// Requires
var UI    = require('ui');
var Ajax  = require('ajax');
var Vibe  = require('ui/vibe');
var Accel = require('ui/accel');

// Define our variables
var debug = 1;
var counter = 0; // parseInt(localStorage.getItem('counter')) || 0; // If the variable counter exists, pull it from the "localStorage" else initialize to zero.
var URL = "http://reddit.com/r/worldnews/top/.json";
var items = [];
var start_time = new Date().valueOf(), new_time, time_diff;
var start_force = 12, new_force, force_diff;
var pass = 0;

var initialized = false;

//Listeners
Pebble.addEventListener("ready", function() {
  console.log("ready called!");
  initialized = true;
});

Pebble.addEventListener("showConfiguration",
  function(e) {
    Pebble.openURL("http://readdit.s3-website-us-east-1.amazonaws.com/"); // our dyanmic configuration page
  }
);
Pebble.addEventListener("webviewclosed",
  function(e) {
  var options = JSON.parse(decodeURIComponent(e.response));
  console.log("Options = " + JSON.stringify(options));
  }
);



// Vibration for installation
if (debug == 1) Vibe.vibrate('short');

// Initial UI
var main = new UI.Card({
  title: 'Readdit',
  subtitle: 'Daily provider of nonsense since 1852',
  body: ''
});

main.show();

// Get datalove from reddit
Ajax({ url: URL, type: 'json' }, function(resp) {
  items = resp.data;
});

// Accelerometer
Accel.init();
/*
Accel.config({
  rate: 25,
  samples: 1,
  subscribe: true
});*/

// Scroll the list up or down
// This function is called on button click and accelerometer thing
function scroll_list(way) {
  main.title(items.children[counter].data.score + " upvotes");
  main.subtitle(items.children[counter].data.domain);
  main.body(items.children[counter].data.title);
  
  if (debug == 1) console.log("Counter: " + counter + "\n");
  
  if(way === 'down' && counter < 24)
     ++counter;
  else if(way === 'down' && counter === 24)
    counter = 0;
  else if(way === 'up' && counter > 0)
    --counter;
  else if(way === 'up' && counter === 0)
    counter = 24;
  
  localStorage.setItem('counter', counter);
}

// Monitor button clicks and call appropriate function
main.on('click', function(e) {
  switch (e.button) {
    case 'up' :
    case 'down' :
      scroll_list(e.button);
      break;
      
    // Link (page and comments) opening
    case 'select' :
      Pebble.openURL("http://reddit.com/" + items.children[counter].data.permalink + ".compact");
      break;
      
    default :
      if (debug == 1) console.log('lolwut');
      break;
  }
});

main.on('accelTap', function(e) {
  /* if (pass > 0) {
    pass--;
    return;
  } */
  scroll_list(e.direction > 0 ? 'up' : 'down');
  // pass += 1;
});

/*
function sleep(millis) {
    setTimeout(function()
            { }
    , millis);
}
*/

/*
Accel.on('data', function(e) {
  if (pass > 0) {
    pass--;
    return;
  }

  if (e.accel.vibe != 0) return;

  new_time = new Date().valueOf();
  time_diff = new_time - start_time;
  start_time = new_time;

  new_force = e.accel.y * 0.05;
  force_diff = start_force - new_force;
  start_force = new_force;

  if (force_diff < -25) {
    pass += 1;
    scroll_list('down');
  } else if (force_diff > 25) {
    pass += 1;
    scroll_list('up');
    // sleep(500);
  }

  /*
  new_time = new Date().valueOf();
  time_diff = new_time - start_time;
  
  if (e.accel.vibe != 0 || time_diff < 500 ) return;

  new_force = e.accel.y * 0.05;
  force_diff = start_force - new_force;
  start_force = new_force;

  if (force_diff < -25 && time_diff ) {
    start_time = new_time;
    console.log('Down' + ' at ' + time_diff);
    sleep(2000);
  } else if (force_diff > 25) {
    start_time = new_time;
    console.log('Up' + ' at ' + time_diff);
    sleep(1500);
  }
  *

  // console.log('Force diff: ' + force_diff + ' at ' + time_diff);
});
*/