const reveals = document.querySelectorAll(".reveal");

function revealSections(){

    const windowHeight = window.innerHeight;

    reveals.forEach(section => {

        const top = section.getBoundingClientRect().top;

        if(top < windowHeight - 120){

            section.classList.add("active");

        }

    });

}

window.addEventListener("scroll", revealSections);

revealSections();



/*==============================
    IMPACT COUNTER===============================*/


const counters = document.querySelectorAll(".counter");

let counterStarted = false;

function runCounter(){

    if(counterStarted) return;
const impactSection = document.getElementById("impact");

    const top = impactSection.getBoundingClientRect().top;

    if(top < window.innerHeight - 100){

        counterStarted = true;

        counters.forEach(counter=>{

            const target = Number(counter.dataset.target);

            let count = 0;

            const speed = target / 150;

            function update(){

                count += speed;

                if(count < target){

                    counter.textContent = Math.floor(count).toLocaleString();

                    requestAnimationFrame(update);

                }else{

                    counter.textContent = target.toLocaleString()+"+";

                }

            }

            update();

        });

    }

}

window.addEventListener("scroll", runCounter);

runCounter();

/*=============================
      DELIVERY TRUCK
=============================*/

const truck = document.querySelector(".truck");

const fill = document.querySelector(".delivery-fill");

window.addEventListener("scroll", ()=>{

    const scrollTop = window.scrollY;

    const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollTop / documentHeight;

    truck.style.top = progress * 100 + "%";

    fill.style.height = progress * 100 + "%";

});


const hero = document.querySelector(".hero");
const heroImage = document.querySelector(".hero-image");

hero.addEventListener("mousemove",(e)=>{

    const x=(e.clientX/window.innerWidth-.5)*20;

    const y=(e.clientY/window.innerHeight-.5)*20;

    heroImage.style.transform=`translate(${x}px,${y}px)`;

});

hero.addEventListener("mouseleave",()=>{

    heroImage.style.transform="translate(0,0)";

});