# giftwrap.js #

A simple tool for reading and writing Javascript objects to a user's
filesystem using the [FileSystem API][fapi] and JSON.

[fapi]: http://www.w3.org/TR/file-system-api/

## Basic Use ##

GiftWrap is great for wrapping up your objects and handing them over to the
local filesystem. Because the FileSystem API is asynchronous, reading and
writing is asynchronous.

To start out with, create a new present:

    new GW.Present({onReady: function(myPresent) {console.log("Ready to go!");}});

You can pass plenty of parameters to the constructor to specify exactly how
you want the present to work. Remember, the GiftWrap library uses one file
per json object.

```javascript
new GW.Present({
  size: 1024*1024*3, // Request 3MB from filesystem
  fileName: "legLamp.json", // Use the file "legLamp.json"
  persistent: false, // Use temporary storage
  errorCallback: function(e) { console.log("Ruh-roh!"); }, // Specify an action if there's an error
  onReady: function(myPresent) { console.log("Let's get going!"); } // What to do once permission granted
});
```

Usually you'll want to start using your present in the onReady function. Here,
we write an object to the file once the object has permission to use the
filesystem.

```javascript
myReady = function(myPresent) {
  var forWriting = {a: "appless", b: "bananas", c: "cucumbers"}
  myPresent.writeObject(forWriting, function() {
    console.log("Successfully saved object!");
  });
};
```

Alternatively, if you've already written an object to the filesystem, you
could read it out like this:

```javascript
myPresent.readObject(function() {
  var readObject = myPresent.getObject();
  console.log("Object read!");
  console.log(readObject);
});
```

And that's pretty much it. You're good to go!

## FileSystem Lock ##

One last thing - gitwrap.js implements locking functionality that is not
included in the FileSystem API. Specifically, giftwrap.js will prevent
concurrent read/writes from occuring in the same file. This means you'll never
have to worry about pesky race conditions or concurrent access problems while
using giftwrap.js.

## Collaborators ##

GiftWrap was part of the work [Jonathan Balsano](http://github.com/jrbalsano)
did for a project in UI Design.
