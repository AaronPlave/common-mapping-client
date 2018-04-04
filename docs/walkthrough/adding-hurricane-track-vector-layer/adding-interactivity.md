# Adding Interactivity

Part of a vector layer's appeal is that the data that is being rendered is available to the client, so let's take a look at how to build some simple interactions with this vector's data. Since this is a storm that progresses up the Atlantic over a certain time period, we'll implement the following:

* Hovering over a point will show the corresponding date, location, wind speed, sea level pressure, and storm category
* Clicking on a point will switch the map to the corresponding date
* Highlight the points corresponding to the currently active date

Let's get started