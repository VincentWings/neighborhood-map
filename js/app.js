//== GLOBAL VARIABLES

// View Model
var ViewModel;

// Default Location (London, UK)
var defaultLocation = {
    lat: 51.509865,
    lng: -0.118092
};

// Vegan Restaurants in London
var restaurants = [
    {
        title: '222 Vegan Cuisine',
        location: {
            lat: 51.4860761,
            lng: -0.2028016
        }
    },
    {
        title: 'The Ragged Canteen',
        location: {
            lat: 51.4905796,
            lng: -0.1839613
        }
    },
    {
        title: 'Sagar',
        location: {
            lat: 51.487123,
            lng: -0.179913
        }
    },
    {
        title: 'The Gate Hammersmith',
        location: {
            lat: 51.487123,
            lng: -0.179913
        }
    },
    {
        title: 'Tibits',
        location: {
            lat: 51.4942942,
            lng: -0.1646188
        }
    },
    {
        title: 'by CHLOE',
        location: {
            lat: 51.5088848,
            lng: -0.1448999
        }
    }
];

// Map container
var map;

// Markers
var markers = [];

// Constructor - Location
var Location = function(data) {
    var self = this;
    this.title = data.title;
    this.location = data.location;
    this.show = ko.observable(true);
};


//== INITIALIZE THE MAP

function initMap() {

    // Create Info Window
    var infoWindow = new google.maps.InfoWindow();

    // Create a new map
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 13
    });

    // Create an array with all the markers
    for (i = 0; i < restaurants.length; i++) {

        // IIFE
        (function() {

            // Get the title from the restaurants array
            var title = restaurants[i].title;

            // Get the location from the restaurants array
            var location = restaurants[i].location;

            // Create a marker per restaurant and put it into the markers array
            var marker = new google.maps.Marker({
                position: location,
                address: address,
                title: title,
                map: map,
                animation: google.maps.Animation.DROP,
                id: i
            });

            // Push the marker to the markers array
            markers.push(marker);

            ViewModel.myRestaurants()[i].marker = marker;

            // When click on the marker, open the InfoWindow
            marker.addListener('click', function() {
                populateInfoWindow(this, infoWindow);
                // Show FourSquare data from the API
                infoWindow.setContent(foursquareData);
            });

            // When marker is clicked populates the infowindow
            function populateInfoWindow(marker, infoWindow) {

                // if infowindow is not already opened on this marker.
                if (infoWindow.marker != marker) {

                    infoWindow.marker = marker;

                    // Add animation to the marker when clicked
                    marker.setAnimation(google.maps.Animation.BOUNCE);

                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 1300);

                    infoWindow.open(map, marker);

                    // If the infowindow is closed, set the marker to null
                    infoWindow.addListener('closeclick', function() {
                        infoWindow.setMarker = null;
                    });

                }
            }

            //== FOURSQUARE AJAX REQUEST

            // Variables
            var venue, address, category, foursquareId, foursquareData;

            // Foursquare Client ID and Client Secret
            var client_id = "I1B1LG0BVU2ZEPVQ1UFXNEZEJDNRI5LMWGPHMTOPRWL5UXTJ";
            var client_secret = "OE1JAPW1K03CM4DVMBL4VIJX5IVFCD22X303QML25MXVI53S";

            // Foursquare API Search for Venues
            var foursquareUrl = "https://api.foursquare.com/v2/venues/search";

            // AJAX Request
            $.ajax({
                url: foursquareUrl,
                dataType: "json",
                data: {
                    client_id: client_id,
                    client_secret: client_secret,
                    query: marker.title,
                    near: "London",
                    v: 20181202
                },
                success: function(data) {

                    // Venue
                    venue = data.response.venues[0];

                    // Address
                    address = venue.location.formattedAddress[0];

                    // Category
                    category = venue.categories[0].name;

                    // Link
                    foursquareId = "https://foursquare.com/v/" + venue.id;

                    // FourSquare data to be used in the InfoWindow
                    foursquareData = `
                        <h1 class='name'>${title}</h1>
                        <div class='category'>${category}</div>
                        <div class='address'>${address}</div>
                        <div class='info'>
                            <a href='${foursquareId}'>More info</a>
                        </div>
                    `;

                    marker.foursquareData;
                },
                error: function() {
                    foursquareData = `
                        <div class='name'>The Foursquare data couldn't be loaded!</div>
                    `;
                }
            });

        })(i);

    }
}

// When error loading the Google Map API
function errorOnLoad() {
    alert("The Map couldn't be loaded!");
}


//== VIEW MODEL

var ViewModel = function() {

    // Show / Hide menu
	this.ShowPanel = ko.observable(false);
    this.ShowMenu = ko.observable(true);
    
	this.showPanel = function() {
		this.ShowMenu(false);
		this.ShowPanel(true);
    }
    
	this.hidePanel = function() {
		this.ShowPanel(false);
		this.ShowMenu(true);
    }

    var self = this;

    // Observables and Observable Arrays
    this.myRestaurants = ko.observableArray();
    this.filteredInput = ko.observable('');

    // Create an array with all the restaurants
    for (i = 0; i < restaurants.length; i++) {
        var restaurant = new Location(restaurants[i]);
        self.myRestaurants.push(restaurant);
    }

    // KnockoutJS - Utility Functions
    this.searchFilter = ko.computed(function() {

        // Search bar filter
        var filter = self.filteredInput().toLowerCase();

        // Create an array with the list of all the restaurants
        for (i = 0; i < self.myRestaurants().length; i++) {

        	// Filter functionality
            if (self.myRestaurants()[i].title.toLowerCase().indexOf(filter) > -1) {

                // Show the restaurants
                self.myRestaurants()[i].show(true);
                if (self.myRestaurants()[i].marker) {
                    // Show marker
                    self.myRestaurants()[i].marker.setVisible(true);
                }

            } else {

                // Hide the restaurants
                self.myRestaurants()[i].show(false); 
                if (self.myRestaurants()[i].marker) {
                    // Hide marker
                    self.myRestaurants()[i].marker.setVisible(false);
                }

            }

        }
    });

    // Add trigger on marker click
    this.showLocation = function(locations) {
        google.maps.event.trigger(locations.marker, 'click');
    };

};

// Create viewModel
ViewModel = new ViewModel();

// Apply bindings
ko.applyBindings(ViewModel);