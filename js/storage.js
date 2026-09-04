// ======================================
// MPower Storage Manager
// ======================================


function getStorage(key){

    try{

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    }

    catch(error){

        console.error(
            "Storage error:",
            error
        );

        return [];

    }

}



function saveStorage(key,data){

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}



function getCurrentUser(){

    return JSON.parse(
        localStorage.getItem(
            "currentUser"
        )
    );

}



function saveCurrentUser(user){

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

}