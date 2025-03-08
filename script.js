let datesData = [];
let currentIndex = 0;
let currentBg = 1;
let autoSlide;
let isPaused = false;


fetch("dates.json")
  .then(response => response.json())
  .then(data => {
    datesData = data;
    currentIndex = 0;
    renderCarousel();
    startAutoSlide();
    updateSlideWidths();
    resetInactivityTimer();
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
  const advanceData = datesData[currentIndex + 1] || null;
  const caption_label = document.getElementById("carousel-caption");
  caption_label.textContent = data.caption;

  if (!data || !data.image) return;

  const imageUrl = data.image;
  const imageUrladv = advanceData ? advanceData.image : null;
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

      setTimeout(() => {
        if (imageUrladv) {
          visibleContainer.style.backgroundImage = `url('${imageUrladv}')`;
        } else {
          visibleContainer.style.backgroundImage = `url('${imageUrl}')`;
        }
      }, 600);
      
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

document.getElementById("togglePauseBtn").addEventListener("click", function() {
  if (isPaused) {
    startAutoSlide();
    this.innerHTML = '<span class="material-symbols-outlined">pause</span>';
  } else {
    clearInterval(autoSlide);
    this.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
  }
  isPaused = !isPaused;
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

document.getElementById("filterBtn").addEventListener("click", filterDatesByYearRange);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("year_search").value = "";
  document.getElementById("description_search").value = "";
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  document.getElementById("dateIntervalsPreset").value = "";
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

function getYearFromDateString(dateStr) {
  const parts = dateStr.trim().split(" ");
  return parseInt(parts[parts.length - 1]);
}

function filterDatesByYearRange() {
  let startYear = document.getElementById("startDate").value;
  let endYear = document.getElementById("endDate").value;
  let yearSearch = document.getElementById("year_search").value;
  let descriptionSearch = document.getElementById("description_search").value.toLowerCase().trim();

  startYear = startYear === '' ? null : parseInt(startYear);
  endYear = endYear === '' ? null : parseInt(endYear);
  yearSearch = yearSearch === '' ? null : yearSearch;

  fetch("dates.json")
    .then(response => response.json())
    .then(data => {
      let filteredDates = data.filter(item => {
        const year = getYearFromDateString(item.date);
        let inRange = true;
        if (startYear !== null && endYear !== null) {
          inRange = year >= startYear && year <= endYear;
        } else if (startYear !== null) {
          inRange = year >= startYear;
        } else if (endYear !== null) {
          inRange = year <= endYear;
        }

        let matchesYear = true;
        if (yearSearch !== null) {
          matchesYear = item.date.includes(yearSearch);
        }

        let matchesText = descriptionSearch === "" ||
                          item.description_bg.toLowerCase().includes(descriptionSearch) ||
                          item.description_en.toLowerCase().includes(descriptionSearch);
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

function parseFullDate(dateString) {
  const months = {
      'януари': 1,
      'февруари': 2,
      'март': 3,
      'април': 4,
      'май': 5,
      'юни': 6,
      'юли': 7,
      'август': 8,
      'септември': 9,
      'октомври': 10,
      'ноември': 11,
      'декември': 12
  };

  const parts = dateString.trim().split(' ');
  if (parts.length === 1) {
    return new Date(parseInt(parts[0]), 0, 1);
  } else if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    return new Date(year, month - 1, day);
  }
  return new Date();
}

function filterDatesByFullDateRange() {
  let startDateStr = document.getElementById("start-date").value;
  let endDateStr = document.getElementById("end-date").value;
  let yearSearch = document.getElementById("year_search").value;
  let descriptionSearch = document.getElementById("description_search").value.toLowerCase().trim();

  let startDateObj = startDateStr ? parseFullDate(startDateStr) : null;
  let endDateObj = endDateStr ? parseFullDate(endDateStr) : null;
  yearSearch = yearSearch === '' ? null : yearSearch;

  fetch("dates.json")
    .then(response => response.json())
    .then(data => {
      let filteredDates = data.filter(item => {
        const itemDateObj = parseFullDate(item.date);
        let inRange = true;
        if (startDateObj && endDateObj) {
          inRange = itemDateObj >= startDateObj && itemDateObj <= endDateObj;
        } else if (startDateObj) {
          inRange = itemDateObj >= startDateObj;
        } else if (endDateObj) {
          inRange = itemDateObj <= endDateObj;
        }

        let matchesYear = true;
        if (yearSearch !== null) {
          matchesYear = item.date.includes(yearSearch);
        }

        let matchesText = descriptionSearch === "" ||
                          item.description_bg.toLowerCase().includes(descriptionSearch) ||
                          item.description_en.toLowerCase().includes(descriptionSearch);
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

document.getElementById('dateIntervalsPreset').addEventListener('change', function() {
  const selectedOption = this.value;
  let startDate, endDate;

  switch (selectedOption) {
      case 'oldGreatBg':
          startDate = '632';
          endDate = '668';
          break;
      case 'firstBg':
          startDate = '680';
          endDate = '1018';
          break;
      case 'secondBg':
          startDate = '1185';
          endDate = '1396';
          break;
      case 'ottomanRule':
          startDate = '1396';
          endDate = '19 февруари 1878';
          break;
      case 'natRevival':
          startDate = '1762';
          endDate = '19 февруари 1878';
          break;
      case 'princedomBg':
          startDate = '01 юли 1878';
          endDate = '22 септември 1908';
          break;
      case 'kingdomBg':
          startDate = '22 септември 1908';
          endDate = '15 септември 1946';
          break;
      case 'socialistBg':
          startDate = '15 септември 1946';
          endDate = '15 ноември 1990';
          break;
      case 'republicBg':
          startDate = '15 ноември 1990';
          endDate = new Date().getFullYear().toString();
          break;
      default:
          startDate = '';
          endDate = '';
          break;
  }

  document.getElementById('start-date').value = startDate;
  document.getElementById('end-date').value = endDate;
  filterDatesByFullDateRange();
});

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

const inactivityTime = 90 * 60 * 1000;
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    pauseCarousel();
    showInactivityModal();
  }, inactivityTime);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);


function pauseCarousel() {
  clearInterval(autoSlide);
}

function resumeCarousel() {
  startAutoSlide();
  resetInactivityTimer();
}

function showInactivityModal() {
  const isActive = confirm("Изглежда, че сте неактивни. Натиснете OK, за да продължите.");
  if (isActive) {
    resumeCarousel();
  }
}
