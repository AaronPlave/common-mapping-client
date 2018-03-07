# Finding the Data

Before we dive in here, please note that the end result of this process is [in this repository](https://github.com/AaronPlave/common-mapping-client-walkthrough/blob/master/src/default-data/demo-default-data/al152017_best_track_Maria.kml) and this information is presented for posterity's sake.

[NOAA](http://www.noaa.gov/) is generally a fantastic go-to option for all things weather and oceanic. As such, we'll hunt their archives to see if we can't find something interesting.

After a fairly quick Google search you may find this page: [https://www.nhc.noaa.gov/data/tcr/](https://www.nhc.noaa.gov/data/tcr/) which lists summary track information for major hurricanes each year. After some more investigation, you'll then find: [http://www.nhc.noaa.gov/gis/best\_track/al152017\_best\_track.kmz](http://www.nhc.noaa.gov/gis/best_track/al152017_best_track.kmz) which is the best track summary of Hurricane Maria.

Once we have our KMZ, we must convert it to KML either using a desktop version of Google Earth or by changing the extension to `.zip` and unzipping the archive to find the KML hidden within.

Finally, we must hand-edit this particular KML as it is not formatted in such a way as to have all the great additional data read by Openlayers or Cesium. For reference, these changes are made following the [KML spec for custom data](https://developers.google.com/kml/documentation/extendeddata).

For each `<Placemark>` there is a set of custom nodes: `<lat>`, `<lon>`, `<stormName>`, `<stormNum>`, `<basin>`, `<stormType>`, `<intensity>`, `<intensityMPH>`, `<intensityKPH>`, `<minSeaLevelPres>`, `<atcfdtg>`, and `<dtg>`. All of those must be wrapped in a parent node, `<ExtendedData>`, and then transformed into a `<Data>` node, like so:

```
...
<Placemark>
    <name>0600 UTC SEP 20</name>
    ...
    <ExtendedData>
        <Data name="lat">
            <displayName>lat</displayName>
            <value>17.6</value>
        </Data>
        <Data name="lon">
            <displayName>lon</displayName>
            <value>-65.1</value>
        </Data>
        <Data name="stormName">
            <displayName>stormName</displayName>
            <value>MARIA</value>
        </Data>
        ...
    </ExtendedData>
</Placemark>
...
```

Once that's done, save it to `src/default-data/demo-default-data/al152017_best_track_Maria.kml`

