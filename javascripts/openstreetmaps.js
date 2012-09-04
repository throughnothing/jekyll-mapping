var jekyllMapping = (function () {
    return {
        mappingInitialize: function() {
            // holds all created maps
            var allMaps = [];
            // nested for loadend event
            var lastLayer;
            
            var maps = document.getElementsByClassName("jekyll-mapping");
            for ( var i = 0; i < maps.length; i++ ) {
                var zoom      = maps[i].getAttribute("data-zoom"),
                    lat       = maps[i].getAttribute("data-latitude"),
                    lon       = maps[i].getAttribute("data-longitude"),
                    layers    = maps[i].getAttribute("data-layers"),
                    title     = maps[i].getAttribute("data-title"),
                    map, markers, center;

                // Set an arbitrary id on the element
                maps[i].setAttribute('id', 'jekyll-mapping' + i);

                markers = new OpenLayers.Layer.Markers("Markers")
                map = new OpenLayers.Map('jekyll-mapping' + i);
                
                // we need the map later for zoomToExtent
                allMaps.push(map);
                
                map.addLayer(new OpenLayers.Layer.OSM());
                map.addLayer(markers);
                if (lat && lon) {
                    center = new OpenLayers.LonLat(lon, lat).transform(
                        new OpenLayers.Projection("EPSG:4326"),
                        new OpenLayers.Projection("EPSG:900913"));
                    map.setCenter(center, zoom);
                    markers.addMarker(new OpenLayers.Marker(center));
                }

                // TODO: make locations work as well
                //if (settings.locations instanceof Array) {
                    //var s, l, m, bounds = new OpenLayers.Bounds();
                    //while (settings.locations.length > 0) {
                        //s = settings.locations.pop();
                        //l = new OpenLayers.LonLat(s.longitude, s.latitude).transform( new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                        //markers.addMarker(new OpenLayers.Marker(l))
                        //bounds.extend(l);
                    //}
                    //map.zoomToExtent(bounds)
                //}

                if (layers) {
                    layers = layers.split(' ');
                    while (layers.length > 0){
                        lastLayer = new OpenLayers.Layer.Vector("KML", {
                                strategies: [new OpenLayers.Strategy.Fixed()],
                                protocol: new OpenLayers.Protocol.HTTP({
                                    url: layers.pop(),
                                    format: new OpenLayers.Format.KML({
                                        extractStyles: true,
                                        extractAttributes: true,
                                        maxDepth: 2
                                    })
                                })
                            });
                        map.addLayer(lastLayer);
                    }
                }
            }
            // now try zooming all maps to extent
            if (allMaps.length > 0 && lastLayer) {
                lastLayer.events.register("loadend", lastLayer, function () {
                    while (allMaps.length > 0) {
                        var map = allMaps.pop();
                        var layers = map.getLayersByClass("OpenLayers.Layer.Vector");
                        var bounds;
                        for (i = 0; i < layers.length; i++) {
                            var l = layers[i];
                            if (l) {
                                var b = l.getDataExtent();
                                if (b) {
                                    if (bounds) {
                                        bounds.extend(b);
                                    } else {
                                        bounds = b;
                                    }
                                }
                            }
                        }
                        if (bounds) {
                            map.zoomToExtent(bounds);
                        } else {
                            map.zoomToMaxExtent();
                        }
                    }
                });
            }
        }
    };
}());

window.onload = function() { jekyllMapping.mappingInitialize(); }
