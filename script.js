// Вземаме всички слайдове и бутоните
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;

function moveSlideLeft() {
    if (currentIndex > 0) { 
        currentIndex--;
        updateCarousel();
    }
}

function moveSlideRight() {
    if (currentIndex < slides.length - 1) {
        currentIndex++;
        updateCarousel();
    }
}

function updateCarousel() {
    const carouselContainer = document.querySelector(".carousel_container");
    carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    if (currentIndex === 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    if (currentIndex === slides.length - 1) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

prevBtn.addEventListener("click", moveSlideLeft);
nextBtn.addEventListener("click", moveSlideRight);

updateCarousel();

