const caption_label = document.getElementById("carousel-caption");
let datesData = [];
let currentIndex = 0;
let currentBg = 1;
let autoSlide;

fetch("dates.json")
  .then(response => response.json())
  .then(data => {
    datesData = data;
    currentIndex = 0;
    renderCarousel();
    startAutoSlide();
    updateSlideWidths();
  })
  .catch(error => console.error("Грешка при зареждане на JSON:", error));

function renderSlideContent(data) {
  if (document.documentElement.lang === "bg") {
    return `<h2>${data.date} г. - ${data.title_bg}</h2>`;
  } else {
    return `<h2>${data.date} - ${data.title_en}</h2>`;
  }
}

function createSlide(data, className) {
  const slide = document.createElement("div");
  slide.className = className;
  if (data) {
    slide.innerHTML = renderSlideContent(data);
  }
  return slide;
}

function renderCarousel() {
  const container = document.querySelector('.carousel_container');
  container.innerHTML = '';
  const n = datesData.length;
  
  container.appendChild(
    createSlide(
      currentIndex - 2 >= 0 ? datesData[currentIndex - 2] : null,
      "slide small left" + (currentIndex - 2 >= 0 ? "" : " placeholder")
    )
  );
  container.appendChild(
    createSlide(
      currentIndex - 1 >= 0 ? datesData[currentIndex - 1] : null,
      "slide medium left" + (currentIndex - 1 >= 0 ? "" : " placeholder")
    )
  );
  
  container.appendChild(createSlide(datesData[currentIndex], "slide large center"));
  
  container.appendChild(
    createSlide(
      currentIndex + 1 < n ? datesData[currentIndex + 1] : null,
      "slide medium right" + (currentIndex + 1 < n ? "" : " placeholder")
    )
  );
  container.appendChild(
    createSlide(
      currentIndex + 2 < n ? datesData[currentIndex + 2] : null,
      "slide small right" + (currentIndex + 2 < n ? "" : " placeholder")
    )
  );
  
  updateDescription();
  updateBackgroundImage();
  updateSlideWidths();
}


function updateDescription() {
  const descriptionBox = document.querySelector('.description-box');
  const data = datesData[currentIndex];
  if (document.documentElement.lang === "bg") {
    descriptionBox.innerHTML = `<p>${data.description_bg}</p>`;
  } else {
    descriptionBox.innerHTML = `<p>${data.description_en}</p>`;
  }
}

function updateBackgroundImage() {
  const data = datesData[currentIndex];
  caption_label.textContent = data.caption
  if (!data || !data.image) return;

  const imageUrl = data.image;
  const bgContainer1 = document.getElementById("bgContainer1");
  const bgContainer2 = document.getElementById("bgContainer2");
  let visibleContainer, hiddenContainer;

  if (currentBg === 1) {
    visibleContainer = bgContainer1;
    hiddenContainer = bgContainer2;
  } else {
    visibleContainer = bgContainer2;
    hiddenContainer = bgContainer1;
  }
  const img = new Image();
  img.src = imageUrl;

  img.onload = function() {
    hiddenContainer.style.backgroundImage = `url('${imageUrl}')`;
    hiddenContainer.style.opacity = 1;

    setTimeout(() => {
      visibleContainer.style.opacity = 0;
      currentBg = currentBg === 1 ? 2 : 1;

      visibleContainer.style.backgroundImage = '';
    }, 50);
  };

  img.onerror = function() {
    console.error("Грешка при зареждане на изображението: " + imageUrl);
  };
}


function movePrev() {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = datesData.length - 1;
  }
  renderCarousel();
}

function moveNext() {
  if (currentIndex < datesData.length - 1) {
    currentIndex++;
  } else {
    currentIndex = 0;
  }
  renderCarousel();
}

document.getElementById("prevBtn").addEventListener("click", () => {
  movePrev();
  startAutoSlide();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  moveNext();
  startAutoSlide();
});


function startAutoSlide() {
  clearInterval(autoSlide);
  const speedSlider = document.getElementById("speedSlider");
  autoSlide = setInterval(() => {
    moveNext();
  }, parseInt(speedSlider.value) * 1000);
}


const speedSlider = document.getElementById("speedSlider");
const speedTooltip = document.getElementById("speedTooltip");

speedSlider.addEventListener("input", (event) => {
  let newSpeed = event.target.value;
  speedTooltip.textContent = `${newSpeed}`;
  startAutoSlide();
  let sliderWidth = speedSlider.offsetWidth;
  let thumbPosition = ((newSpeed - speedSlider.min) / (speedSlider.max - speedSlider.min)) * sliderWidth;
  speedTooltip.style.left = `${thumbPosition}px`;
  speedTooltip.style.visibility = "visible";
});
speedSlider.addEventListener("mouseleave", () => {
  speedTooltip.style.visibility = "hidden";
});
speedSlider.addEventListener("mouseover", () => {
  speedTooltip.style.visibility = "visible";
});

document.getElementById("languageSelect").addEventListener("change", (event) => {
  changeLanguage(event.target.value);
});
function changeLanguage(language) {
  if (language === "bg") {
    document.documentElement.lang = "bg";
    document.querySelector("title").textContent = "Тест на Carousel";
    document.getElementById("choose_lang").textContent = "Изберете език:";
    document.getElementById("date_range").textContent = "Изберете диапазон от години:";
    document.getElementById("startDate").placeholder = "Начална година";
    document.getElementById("endDate").placeholder = "Крайна година";
    document.getElementById("filterBtn").textContent = "Филтър";
    document.getElementById("resetBtn").textContent = "Изчисти филтрирането";
    document.getElementById("speed_carousel").textContent = "Скорост на карусела (сек.):";
  } else {
    document.documentElement.lang = "en";
    document.querySelector("title").textContent = "Carousel Test";
    document.getElementById("choose_lang").textContent = "Choose language:";
    document.getElementById("date_range").textContent = "Type year range:";
    document.getElementById("startDate").placeholder = "Start date";
    document.getElementById("endDate").placeholder = "End date";
    document.getElementById("filterBtn").textContent = "Filter";
    document.getElementById("resetBtn").textContent = "Reset";
    document.getElementById("speed_carousel").textContent = "Carousel speed (in seconds):";
  }
  renderCarousel();
}

document.getElementById("filterBtn").addEventListener("click", filterDatesByRange);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("year_search").value = "";
  document.getElementById("description_search").value = "";
  fetch("dates.json")
    .then(response => response.json())
    .then(data => {
      datesData = data;
      currentIndex = 0;
      renderCarousel();
      startAutoSlide();
    })
    .catch(error => console.error("Грешка при зареждане на JSON:", error));
});

function filterDatesByRange() {
  let startDate = document.getElementById("startDate").value;
  let endDate = document.getElementById("endDate").value;
  let yearSearch = document.getElementById("year_search").value;
  let descriptionSearch = document.getElementById("description_search").value.toLowerCase().trim();

  startDate = startDate === '' ? null : parseInt(startDate);
  endDate = endDate === '' ? null : parseInt(endDate);
  yearSearch = yearSearch === '' ? null : parseInt(yearSearch);

  fetch("dates.json")
    .then(response => response.json())
    .then(data => {
      let filteredDates = data.filter(item => {
        const year = parseInt(item.date);
        const descriptionBg = item.description_bg.toLowerCase();
        const descriptionEn = item.description_en.toLowerCase();

        let inRange = true;
        if (startDate !== null && endDate !== null) {
          inRange = year >= startDate && year <= endDate;
        } else if (startDate !== null) {
          inRange = year >= startDate;
        } else if (endDate !== null) {
          inRange = year <= endDate;
        }

        let matchesYear = true;
        if (yearSearch !== null) {
          matchesYear = item.date.includes(yearSearch);
        }

        let matchesText = descriptionSearch === "" || 
                          descriptionBg.includes(descriptionSearch) || 
                          descriptionEn.includes(descriptionSearch);

        return inRange && matchesYear && matchesText;
      });

      if (filteredDates.length > 0) {
        datesData = filteredDates;
        currentIndex = 0;
        renderCarousel();
        startAutoSlide();
      } else {
        alert(document.documentElement.lang === "bg" ?
          "Няма резултати за зададените критерии!" :
          "No results for the selected criteria!");
      }
    })
    .catch(error => console.error("Грешка при зареждане на JSON:", error));
}
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    clearInterval(autoSlide);
  } else {
    startAutoSlide();
  }
});
function updateSlideWidths() {
  const slides = document.querySelectorAll('.slide');
  const centerIndex = Math.floor(slides.length / 2);

  slides.forEach((slide, index) => {
      const distance = Math.abs(centerIndex - index);

      let newWidth;
      if (distance === 0) {
          newWidth = "40%";
      } else if (distance === 1) {
          newWidth = "25%";
      } else {
          newWidth = "15%";
      }

      slide.style.width = newWidth;
  });
}
