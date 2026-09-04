// ======================================
// MPower Volunteer Map
// ======================================

"use strict";


// ======================================
// MAP CONTAINER
// ======================================

const volunteerMapContainer =
    document.getElementById("volunteerMap");



if (!volunteerMapContainer) {


    console.log(
        "Volunteer map not found."
    );


} else {



    // ======================================
    // CREATE MAP
    // ======================================

    const map =
        L.map("volunteerMap")
            .setView(
                [9.0820, 8.6753],
                6
            );



    // ======================================
    // TILE LAYER
    // ======================================

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            attribution:
                "© OpenStreetMap contributors"

        }

    ).addTo(map);




    // ======================================
    // GET AVAILABLE DELIVERIES
    // ======================================

    const deliveries =

        typeof getAvailableDeliveries === "function"

        ?

        getAvailableDeliveries()

        :

        [];





    // ======================================
    // EMPTY STATE
    // ======================================

    if (!deliveries.length) {


        L.popup()

            .setLatLng(
                [
                    9.0820,
                    8.6753
                ]
            )

            .setContent(
                "<strong>No deliveries available.</strong>"
            )

            .openOn(map);


    }





    // ======================================
    // MAP BOUNDS
    // ======================================

    const bounds = [];





    // ======================================
    // CREATE MARKERS
    // ======================================

    deliveries.forEach(
        delivery => {



            if (

                !delivery.latitude ||

                !delivery.longitude

            ) {


                return;


            }





            const latitude =

                Number(
                    delivery.latitude
                );



            const longitude =

                Number(
                    delivery.longitude
                );





            if (

                Number.isNaN(latitude)

                ||

                Number.isNaN(longitude)

            ) {


                return;


            }






            bounds.push(

                [

                    latitude,

                    longitude

                ]

            );







            // ======================================
            // POPUP CONTENT
            // ======================================


            const popup = `


<div class="map-popup">


<h3>

${delivery.foodName}

</h3>



<p>

<strong>Restaurant:</strong>

${delivery.ownerName || "Unknown"}

</p>



<p>

<strong>Charity:</strong>

${delivery.requesterName || "Unknown"}

</p>



<p>

<strong>Category:</strong>

${delivery.category}

</p>



<p>

<strong>Quantity:</strong>

${delivery.requestQuantity}

${delivery.requestUnit}

</p>



<p>

<strong>Pickup:</strong>

${delivery.location}

</p>



<p>

<strong>Pickup Date:</strong>

${formatDate(
    delivery.requestPickupDate
)}

</p>



<p>

<strong>Expiry:</strong>

${formatDate(
    delivery.expiry
)}

</p>



<p>

<strong>Status:</strong>

Waiting for Volunteer

</p>




<a

href="https://www.google.com/maps?q=${latitude},${longitude}"

target="_blank"

class="directions-btn"

>

<i class="fa-solid fa-diamond-turn-right"></i> Get Directions

</a>



</div>


`;








            // ======================================
            // CREATE MARKER
            // ======================================


            const marker =

                L.marker(

                    [

                        latitude,

                        longitude

                    ]

                )

                .addTo(map)

                .bindPopup(
                    popup
                );







            // ======================================
            // OPEN DELIVERY MODAL
            // ======================================


            marker.on(

                "click",

                function(){


                    if (

                        typeof openDonationModal === "function"

                    ) {


                        openDonationModal(

                            delivery.id,

                            delivery.requestId

                        );


                    }


                }

            );





        }

    );






    // ======================================
    // FIT MAP TO MARKERS
    // ======================================


    if (bounds.length) {


        map.fitBounds(

            bounds,

            {

                padding:

                    [

                        50,

                        50

                    ]

            }

        );


    }





    console.log(

        "Volunteer map loaded successfully."

    );


}