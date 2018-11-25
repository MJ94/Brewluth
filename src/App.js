import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import SideBar from './components/SideBar.js';

class App extends Component {
  state = {
    breweries: []
  }

  // Get venue data from Foursquare when component mounts
  componentDidMount() {
    this.getVenues()

    // Alerts user if there are any issues loading the  Google Maps API
    window.gm_authFailure = () => {
      alert(
        "This page didn't load Google Maps correctly. See the JavaScript console for technical details."
      )
    }
  }

  loadMap = () => {
    const googleMapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    loadScript(`https://maps.googleapis.com/maps/api/js?v=3.exp&key=${googleMapsKey}&callback=initMap`)
    window.initMap = this.initMap;
  }

  // Data needed when using Foursquare API
  getVenues = () => {
    const foursquareClientId = process.env.REACT_APP_FOURSQUARE_CLIENT_ID;
    const foursquareClientSecret = process.env.REACT_APP_FOURSQUARE_CLIENT_SECRET;
    const endPoint = "https://api.foursquare.com/v2/venues/explore?"
    const parameters = {
      client_id: `${foursquareClientId}`,
      client_secret: `${foursquareClientSecret}`,
      query: "breweries",
      near: "Duluth, Minnesota",
      v: "20181811"
    }

    // Get data from Foursquare and add venues (breweries) to state
    axios.get(endPoint + new URLSearchParams(parameters))
    .then(res => {
      this.setState({
        breweries: res.data.response.groups[0].items
      }, this.loadMap());
      console.log(res);
    })
    .catch((err) => {
      console.log(`Error in Axios get attempt: ${err}`);
      alert("There was an error fetching venue data; please see the JavaScript console for technical details.")
    })
  }

  // Initialize the map per Google Maps JavaScript API
  initMap = () => {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 46.785039, lng: -92.107418},
      zoom: 13.5
    });

    // Create infowindow outside of loop
    const infowindow = new window.google.maps.InfoWindow({
    });

    // Map through breweries in state and add a marker for each venue
    this.state.breweries.map(stateBreweries => {
      const position = {
        lat: stateBreweries.venue.location.lat,
        lng: stateBreweries.venue.location.lng
      }
      const animation = window.google.maps.Animation.DROP
      const title = stateBreweries.venue.name
      const id = stateBreweries.venue.id
      const content = `
      <h4>${stateBreweries.venue.name}</h4 <br>
      <p>${stateBreweries.venue.location.formattedAddress[0]}</p>
      <p>${stateBreweries.venue.location.formattedAddress[1]}</p>
      `

      const marker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: title,
      id: id,
      animation: animation
    })

    // Update content of and open an info window when marker clicked
    marker.addListener('click', function () {
      infowindow.setContent(content)
      infowindow.open(map, marker)
    });
  });

}

  render() {
    return (
      <div className="App">
        <SideBar />
      <main>
        <div id="map"></div>
      </main>
    </div>

    );
  }
}

  // Code to load Google Maps without using any external components
  const loadScript = (source) => {
  const firstScriptTag = window.document.getElementsByTagName("script")[0];
  const script = window.document.createElement("script");
  script.src = source;
  script.async = true;
  script.defer = true;
  firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
}

export default App;
