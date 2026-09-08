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

// DETECT USER LOCATION

// ======================================
async function reverseGeocode(lat, lng){
// SEARCH LOCATION
try {
const response = await fetch(
`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
);
const data = await response.json();
return data.display_name || `Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`;
} catch (error) {
console.error("Reverse geocoding failed:", error);
return `Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`;
}

}

function showDetectedLocation(lat, lng, label){
if(marker){
map.removeLayer(marker);
}

marker = L.marker([lat, lng]).addTo(map);
map.setView([lat, lng], 15);
updateLocation(lat, lng);
document.getElementById("location").value = label;
selectedLocation.textContent = `Detected: ${label}`;
}

function detectUserLocation(){
if(!navigator.geolocation){
selectedLocation.textContent = "Location detection is not supported by this browser.";
return;
}

navigator.geolocation.getCurrentPosition(
async function(position){
const lat = position.coords.latitude;
const lng = position.coords.longitude;
selectedLocation.textContent = "Location detected. Finding the address...";
const label = await reverseGeocode(lat, lng);
showDetectedLocation(lat, lng, label);
},
function(error){
console.error("Location detection failed:", error);
selectedLocation.textContent = "Please allow location access to submit a donation.";
},
{
enableHighAccuracy: true,
timeout: 10000,
maximumAge: 300000
}
);
}

window.MPOWER_REFRESH_LOCATION = detectUserLocation;
detectUserLocation();
});

}



}
