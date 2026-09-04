// ======================================
// MPower Location Picker
// ======================================


const mapBox =
document.getElementById("donationMap");


if(mapBox){


let selectedLat = null;
let selectedLng = null;


const latitudeInput =
document.getElementById("latitude");


const longitudeInput =
document.getElementById("longitude");


const selectedLocation =
document.getElementById("selectedLocation");


const locationInput =
document.getElementById("location");



const map =
L.map("donationMap")
.setView(
    [4.8156,7.0498],
    13
);



L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
{
    attribution:
    "© OpenStreetMap"
}
)
.addTo(map);



let marker = null;



// ======================================
// UPDATE LOCATION
// ======================================

function updateLocation(lat,lng){


selectedLat = lat;

selectedLng = lng;


latitudeInput.value = lat;

longitudeInput.value = lng;


selectedLocation.textContent =
`
Selected:
${lat.toFixed(5)},
${lng.toFixed(5)}
`;

}



// ======================================
// CLICK MAP
// ======================================

map.on(
"click",
function(event){


const lat =
event.latlng.lat;


const lng =
event.latlng.lng;



if(marker){

map.removeLayer(marker);

}



marker =
L.marker(
[
lat,
lng
]
)
.addTo(map);



updateLocation(
lat,
lng
);


});




// ======================================
// SEARCH LOCATION
// ======================================


if(locationInput){


locationInput.addEventListener(
"change",
async function(){


const place =
this.value.trim();



if(!place) return;



try{


const response =
await fetch(
`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`
);



const data =
await response.json();



if(data.length === 0){

    showMessage(
        "We couldn't find that location. Please try another search.",
        "warning",
        "Location Not Found"
    );

return;

}



const lat =
Number(data[0].lat);



const lng =
Number(data[0].lon);



map.setView(
[
lat,
lng
],
15
);



if(marker){

map.removeLayer(marker);

}



marker =
L.marker(
[
lat,
lng
]
)
.addTo(map);



updateLocation(
lat,
lng
);



}


catch(error){

console.error(
"Location search failed:",
error
);

}



});

}



}