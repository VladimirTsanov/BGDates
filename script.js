function displayDates(dates) {
    const container = document.querySelector(".carousel_container");

    dates.forEach(item => {
        const slide = document.createElement("div");
        slide.classList.add("slide");

        slide.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h2>${item.date} г. - ${item.title}</h2>
            <p>${item.description}</p>
        `;

        container.appendChild(slide);
    });
}

const carouselContainer = document.querySelector(".carousel_container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const filterBtn = document.getElementById("filterBtn");
const resetBtn = document.getElementById("resetBtn");

let allDates = [];
let slides;
fetch("dates.json")
    .then(response => response.json())
    .then(data => {
        allDates = data;
        displayDates(data);
        addClones();

        slides = document.querySelectorAll(".slide");
        
        starAutoSlide();
    })
    .catch(error => console.error("Грешка при зареждане на JSON:", error));

let currentIndex = 0;


function moveSlideRight() {
    if (currentIndex >= slides.length + 1) return;

    currentIndex++;
    carouselContainer.style.transition = "transform 0.5s ease-in-out";
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    setTimeout(() => {
        if (currentIndex === slides.length - 1) {
            carouselContainer.style.transition = "none";
            currentIndex = 1;
            carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }, 500);
}

    
function moveSlideLeft() {
    if (currentIndex <= 0) return;

    currentIndex--;
    carouselContainer.style.transition = "transform 0.5s ease-in-out";
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    setTimeout(() => {
        if (currentIndex === 0) {
            carouselContainer.style.transition = "none";
            currentIndex = slides.length - 2;
            carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }, 500);
}


function addClones() {
    const slides = document.querySelectorAll(".slide");
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.id = "first-clone";
    lastClone.id = "last-clone";

    const carouselContainer = document.querySelector(".carousel_container");
    carouselContainer.appendChild(firstClone);
    carouselContainer.insertBefore(lastClone, slides[0]);
    carouselContainer.style.transform = `translateX(-100%)`;
    currentIndex = 1;
}

let autoSlide;

function starAutoSlide(){
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        moveSlideRight();
    }, 6000);

}

prevBtn.addEventListener("click", () => {
    moveSlideLeft();
    starAutoSlide();
});
nextBtn.addEventListener("click", () => {
    moveSlideRight();
    starAutoSlide();
});
filterBtn.addEventListener("click", function() {
    filterDatesByRange();
});
resetBtn.addEventListener("click", () => {
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    const carouselContainer = document.querySelector('.carousel_container');
    carouselContainer.innerHTML = '';
    fetch("dates.json")
    .then(response => response.json())
    .then(data => {
        allDates = data;
        displayDates(data);
        addClones();

        slides = document.querySelectorAll(".slide");
        
        starAutoSlide();
    })
    .catch(error => console.error("Грешка при зареждане на JSON:", error));

});

const languageSelect = document.getElementById("languageSelect");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

languageSelect.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    changeLanguage(selectedLanguage);
});



function changeLanguage(language) {

    if (language === "bg") {

    } else if (language === "en") {

    }
}

function filterDatesByRange(start, end) {
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    startDate = startDate === '' ? null : parseInt(startDate);
    endDate = endDate === '' ? null : parseInt(endDate);    
    
    if ((startDate < 0 && endDate <0) || (startDate < 0 || endDate < 0)){
        alert("Дати не могат да бъдат отрицателни!");
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
        return;
    }


fetch("dates.json")
    .then(response => response.json())
    .then(data => {
        let filteredDates = [];

        for (let item of data){

            const year = getYearFromDate(item.date);

            if ((startDate && year >= startDate) && (endDate && year <= endDate)) {
                filteredDates.push(item); 
            } else if (startDate === 0 && (year >= startDate && year <= endDate) ) {
                filteredDates.push(item);
            } else if ((startDate > endDate && endDate === 0) || (startDate > endDate)) {
                const temp = startDate;
                startDate = endDate;
                endDate = temp;
                if (year >= startDate && year <= endDate) {
                    filteredDates.push(item);
                }

            }
        }    
        if (filteredDates.length > 0) {
             updateCarousel(filteredDates);
        } else {
            alert("Няма дати в зададения диапазон!");
    }})
    .catch(error => console.error("Грешка при зареждане на JSON:", error));

}
function getYearFromDate(dateString) {
    // Ако датата е само година
    if (/^\d{3,4}$/.test(dateString)) {
      return parseInt(dateString);
    }
  

    const yearMatch = dateString.match(/(\d{4})/);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
  
    return null;
}

function updateCarousel(filteredData) {
    const carouselContainer = document.querySelector('.carousel_container');
    carouselContainer.innerHTML = '';
  

    filteredData.forEach(item => {
      const slide = document.createElement('div');
      slide.classList.add('slide');
      slide.innerHTML = `
        <img src="${item.image}" alt="Историческа дата">
        <h2>${item.date} г. - ${item.title}</h2>
        <p>${item.description}</p>
      `;
      carouselContainer.appendChild(slide);
    });


    if (filteredData.length > 1) {
    addClones(); 
    slides = document.querySelectorAll(".slide");
    currentIndex = 1;
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    starAutoSlide();
  } else {
    clearInterval(autoSlide);
    const tempClone = slides[0].cloneNode(true);
    carouselContainer.appendChild(tempClone)
    carouselContainer.style.transition = "none";
    carouselContainer.style.transform = 'translateX(100%)';
    setTimeout(() => {
        carouselContainer.style.transition = 'transform 0.5s ease-in-out';
        carouselContainer.style.transform = 'translateX(0)';
      }, 50);
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

}

function changeCarouselSpeed(newSpeed) {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        moveSlideRight();
    }, newSpeed);
}

const speedSlider = document.getElementById("speedSlider");
const speedTooltip = document.getElementById("speedTooltip");

speedSlider.addEventListener("input", (event) => {
    let newSpeed = event.target.value;
    speedTooltip.textContent = `${newSpeed}`;
    changeCarouselSpeed(newSpeed * 1000);

    let sliderWidth = speedSlider.offsetWidth;
    let thumbPosition = (newSpeed - speedSlider.min) / (speedSlider.max - speedSlider.min) * sliderWidth;
    
    speedTooltip.style.left = `${thumbPosition}px`;
    speedTooltip.style.visibility = "visible";
});

speedSlider.addEventListener("mouseleave", () => {
    speedTooltip.style.visibility = "hidden";
});

speedSlider.addEventListener("mouseover", () => {
    speedTooltip.style.visibility = "visible";
});

document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        clearInterval(autoSlide);
    } else {
        starAutoSlide();
    }
});
