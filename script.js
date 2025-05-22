// -------- DECLARATIONS --------- //
let currentIndex = 0
let currentBg = 1
let autoSlide
let isPaused = false
const inactivityTime = 90 * 60 * 1000
let inactivityTimer
let isInit = true
let filteredData = []
let datesData

const menuToggle = document.getElementById("menuToggle")
const dropdownMenu = document.getElementById("dropdownMenu")
const chevron = document.querySelector(".material-symbols-outlined")
const playPauseButton = document.getElementById("playPauseButton")
const languageSwitch = document.getElementById("languageSwitch")
const speedSlider = document.getElementById("speedSlider")
const speedTooltip = document.getElementById("speedTooltip")
const prevButton = document.getElementById("prevButton")
const nextButton = document.getElementById("nextButton")
const filterYearRangeBtn = document.getElementById("filterYearRangebtn")
const resetFilter = document.getElementById("clearFilter")
const searchBtn1 = document.getElementById("searchBtn1")
const searchBtn2 = document.getElementById("searchBtn2")
const playIco = document.getElementById("playIcon")
const pauseIco = document.getElementById("pauseIcon")

// -------- INITIALIZATION --------- //

document.addEventListener("DOMContentLoaded", () => {
  let savedLang = localStorage.getItem("lang") || "bg"

  if (savedLang !== "bg" && savedLang !== "en") {
    console.warn('Невалиден език в localStorage. Използва се "bg" по подразбиране.')
    savedLang = "bg"
  }

  document.documentElement.lang = savedLang
  languageSwitch.classList.add(savedLang)
  changeLanguage(savedLang)

  initMenuHover()
  fetch("dates.json")
    .then((res) => res.json())
    .then((data) => {
      datesData = data
      currentIndex = 0
      renderCarousel()
      startAutoSlide()
      updateSlideWidths()
      resetInactivityTimer()
      updateCaption()
      isInit = false
    })
    .catch((err) => console.error("JSON load error:", err))
})

function initMenuHover() {
  const menuItems = document.querySelectorAll(".menu-item")
  const containers = {
    filter: document.querySelector(".filter-container"),
    periodList: document.querySelector(".period-list-container"),
    search: document.querySelector(".search-container"),
    timelineControl: document.querySelector(".timeline-control-container"),
  }

  let activeContainer = null
  let isOverContainer = false

  Object.values(containers).forEach((container) => document.body.appendChild(container))

  menuItems.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      hideAllContainers()
      const keys = Object.keys(containers)
      const container = containers[keys[index]]
      if (container) {
        container.classList.add("active-filter")
        activeContainer = container
      }
    })
  })

  dropdownMenu.addEventListener("mouseleave", () => {
    if (!isOverContainer) hideAllContainers()
  })

  document.addEventListener("click", (e) => {
    if (
      !dropdownMenu.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      !Object.values(containers).some((c) => c.contains(e.target))
    ) {
      hideAllContainers()
    }
  })

  Object.values(containers).forEach((container) => {
    container.addEventListener("mouseenter", () => {
      isOverContainer = true
      container.classList.add("active-filter")
    })
    container.addEventListener("mouseleave", () => {
      isOverContainer = false
      container.classList.remove("active-filter")
    })
  })

  function hideAllContainers() {
    Object.values(containers).forEach((container) => container.classList.remove("active-filter"))
  }

  menuToggle.addEventListener("click", (e) => {
    e.preventDefault()
    dropdownMenu.classList.toggle("open")
    chevron.classList.toggle("up")
  })
}

function startAutoSlide() {
  clearInterval(autoSlide)
  autoSlide = setInterval(moveNext, Number(speedSlider.value) * 1000)
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    clearInterval(autoSlide)
    if (confirm("Изглежда, че сте неактивни. Натиснете OK, за да продължите.")) {
      startAutoSlide()
      resetInactivityTimer()
    }
  }, inactivityTime)
}

// -------- UTILITY FUNCTIONS --------- //

function getYearFromDateString(dateStr) {
  const parts = dateStr.trim().split(" ")
  return Number.parseInt(parts[parts.length - 1])
}

function parseFullDate(dateString) {
  const months = {
    януари: 1,
    февруари: 2,
    март: 3,
    април: 4,
    май: 5,
    юни: 6,
    юли: 7,
    август: 8,
    септември: 9,
    октомври: 10,
    ноември: 11,
    декември: 12,
  }

  const cleaned = dateString
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, "-")
    .replace(/г\./g, "")
    .replace(/\s+/g, " ")
    .replace(/^\D*(\d)/, "$1")

  if (/^\d{3,4}\/\d{3,4}$/.test(cleaned)) {
    return new Date(Number.parseInt(cleaned.split("/")[0]), 0, 1)
  }

  if (/^\d{3,4}-\d{3,4}$/.test(cleaned)) {
    return new Date(Number.parseInt(cleaned.split("-")[0]), 0, 1)
  }

  const fullDateMatch = cleaned.match(/^(\d{1,2})(-|–)?(\d{1,2})?\s+([а-я]+)\s+(\d{4})$/)
  if (fullDateMatch) {
    const day = Number.parseInt(fullDateMatch[1])
    const month = months[fullDateMatch[4]]
    const year = Number.parseInt(fullDateMatch[5])
    if (month) return new Date(year, month - 1, day)
  }

  const monthYearMatch = cleaned.match(/^([а-я]+)\s+(\d{4})$/)
  if (monthYearMatch) {
    const month = months[monthYearMatch[1]]
    const year = Number.parseInt(monthYearMatch[2])
    if (month) return new Date(year, month - 1, 1)
  }

  const dayMonthYearMatch = cleaned.match(/^(\d{1,2})\s+([а-я]+)\s+(\d{4})$/)
  if (dayMonthYearMatch) {
    const day = Number.parseInt(dayMonthYearMatch[1])
    const month = months[dayMonthYearMatch[2]]
    const year = Number.parseInt(dayMonthYearMatch[3])
    if (month) return new Date(year, month - 1, day)
  }

  const fullPeriodMatch = cleaned.match(/^(\d{1,2})\s+([а-я]+)\s+(\d{4})\s*-\s*\d{1,2}\s+[а-я]+\s+\d{4}$/)
  if (fullPeriodMatch) {
    const day = Number.parseInt(fullPeriodMatch[1])
    const month = months[fullPeriodMatch[2]]
    const year = Number.parseInt(fullPeriodMatch[3])
    if (month) return new Date(year, month - 1, day)
  }

  const seasonMatch = cleaned.match(/(пролетта|лятото|есента|зимата)\s+(\d{4})/)
  if (seasonMatch) {
    return new Date(Number.parseInt(seasonMatch[2]), 0, 1)
  }

  if (/^\d{3,4}$/.test(cleaned)) {
    return new Date(Number.parseInt(cleaned), 0, 1)
  }

  console.warn("Неразпозната дата:", dateString)
  return new Date(0, 0, 1)
}

function filterDatesByRange(startDateStr, endDateStr) {
  const startDateObj = startDateStr ? parseFullDate(startDateStr) : null
  const endDateObj = endDateStr ? parseFullDate(endDateStr) : null

  fetch("dates.json")
    .then((response) => response.json())
    .then((data) => {
      filteredData = data.filter((item) => {
        const itemDate = parseFullDate(item.date)
        if (startDateObj && endDateObj) return itemDate >= startDateObj && itemDate <= endDateObj
        if (startDateObj) return itemDate >= startDateObj
        if (endDateObj) return itemDate <= endDateObj
        return true
      })

      if (filteredData.length > 0) {
        datesData = filteredData
        currentIndex = 0
        renderCarousel()
        startAutoSlide()

        showFilterSuccess()
      } else {
        alert(
          document.documentElement.lang === "bg"
            ? "Няма резултати за зададения период."
            : "No results for the selected period.",
        )
      }
    })
    .catch((err) => console.error("Грешка при зареждане на JSON:", err))
}

function showFilterSuccess() {
  const notification = document.createElement("div")
  notification.className = "filter-notification"
  notification.innerHTML =
    document.documentElement.lang === "bg" ? "Филтърът е приложен успешно!" : "Filter applied successfully!"

  notification.style.position = "fixed"
  notification.style.bottom = "20px"
  notification.style.left = "50%"
  notification.style.transform = "translateX(-50%)"
  notification.style.backgroundColor = "#00966e"
  notification.style.color = "white"
  notification.style.padding = "10px 20px"
  notification.style.borderRadius = "30px"
  notification.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
  notification.style.zIndex = "9999"
  notification.style.opacity = "0"
  notification.style.transition = "all 0.5s ease"

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "1"
  }, 100)

  setTimeout(() => {
    notification.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 3000)
}

function determinePeriod(dateStr) {
  const year = getYearFromDateString(dateStr)

  if (year >= 632 && year <= 668) return "oldGreatBg"
  if (year >= 680 && year <= 1018) return "firstBg"
  if (year >= 1185 && year <= 1396) return "secondBg"
  if (year >= 1396 && year <= 1878) return "ottomanRule"
  if (year >= 1762 && year <= 1878) return "natRevival"
  if (year >= 1878 && year <= 1908) return "princedomBg"
  if (year >= 1908 && year <= 1946) return "kingdomBg"
  if (year >= 1946 && year <= 1990) return "socialistBg"
  if (year >= 1990) return "republicBg"

  return null
}

// -------- RENDER FUNCTIONS --------- //

function renderCarousel() {
  const container = document.querySelector(".carousel_container")
  container.innerHTML = ""

  const slide = (offset, size) => {
    const i = currentIndex + offset
    const data = i >= 0 && i < datesData.length ? datesData[i] : null
    const className = `slide ${size} ${offset < 0 ? "left" : offset > 0 ? "right" : "center"}${data ? "" : " placeholder"}`
    return createSlide(data, className)
  }

  container.append(slide(-2, "small"), slide(-1, "medium"), slide(0, "large"), slide(1, "medium"), slide(2, "small"))

  updateDescription()
  updateBackgroundImage()
  updateSlideWidths()
  updateCaption()
}

function createSlide(data, className) {
  const slide = document.createElement("div")
  slide.className = className

  if (data) {
    const period = determinePeriod(data.date)
    if (period) {
      slide.setAttribute("data-period", period)
    }

    slide.innerHTML = renderSlideContent(data)
  }

  return slide
}

function renderSlideContent(data) {
  const lang = document.documentElement.lang
  const title = lang === "bg" ? data.title_bg : data.title_en
  const date = lang === "bg" ? `${data.date} г.` : data.date
  return `<h2>${date} - ${title}</h2>`
}

function updateDescription() {
  const box = document.querySelector(".description-box")
  const data = datesData[currentIndex]
  box.innerHTML = `<p>${document.documentElement.lang === "bg" ? data.description_bg : data.description_en}</p>`
}

function updateCaption() {
  const caption = document.getElementById("carousel-caption")
  caption.textContent = datesData[currentIndex].caption
  caption.style.display = caption.textContent.trim() ? "block" : "none"
}

function updateBackgroundImage() {
  const current = datesData[currentIndex]
  const next = datesData[currentIndex + 1] || current
  const bg1 = document.getElementById("bgContainer1")
  const bg2 = document.getElementById("bgContainer2")

  const visible = currentBg === 1 ? bg1 : bg2
  const hidden = currentBg === 1 ? bg2 : bg1

  const img = new Image()
  img.src = current.image
  img.onload = () => {
    hidden.style.backgroundImage = `url('${current.image}')`
    hidden.style.opacity = "0"

    hidden.style.opacity = "1"
    visible.style.opacity = "0"

    currentBg = 3 - currentBg

    visible.style.backgroundImage = `url('${next.image}')`
  }
  img.onerror = () => console.error("Image load error:", current.image)
}

function updateSlideWidths() {
  const slides = document.querySelectorAll(".slide")
  const center = Math.floor(slides.length / 2)

  slides.forEach((s, i) => {
    const d = Math.abs(center - i)
    s.style.width = d === 0 ? "40%" : d === 1 ? "25%" : "15%"
  })
}

// -------- EVENT LISTENERS --------- //

playPauseButton.addEventListener("click", () => {
  if (isPaused) {
    playPauseButton.style.backgroundColor = "#00966e"
    startAutoSlide()
    playIco.style.display = "none"
    pauseIco.style.display = "flex"
  } else {
    playPauseButton.style.backgroundColor = "#d62612"
    clearInterval(autoSlide)
    playIco.style.display = "block"
    pauseIco.style.display = "none"
  }
  isPaused = !isPaused
})

prevButton.addEventListener("click", () => {
  movePrev()
  startAutoSlide()
})

nextButton.addEventListener("click", () => {
  moveNext()
  startAutoSlide()
})

languageSwitch.addEventListener("click", () => {
  clearInterval(autoSlide)
  const newLang = document.documentElement.lang === "bg" ? "en" : "bg"

  languageSwitch.classList.toggle("en", newLang === "en")
  languageSwitch.classList.toggle("bg", newLang === "bg")

  localStorage.setItem("lang", newLang)

  changeLanguage(newLang)
  startAutoSlide()
})

filterYearRangeBtn.addEventListener("click", () => {
  filterDatesByYearRange()
})

searchBtn1.addEventListener("click", () => {
  let yearSearch = document.getElementById("yearSearch").value
  yearSearch = yearSearch === "" ? null : yearSearch

  fetch("dates.json")
    .then((response) => response.json())
    .then((data) => {
      filteredData = data.filter((item) => {
        let matchesYear = true
        if (yearSearch !== null) {
          matchesYear = item.date.includes(yearSearch)
        }

        return matchesYear
      })

      if (filteredData.length > 0) {
        datesData = filteredData
        currentIndex = 0
        renderCarousel()
        startAutoSlide()
        showFilterSuccess()
      } else {
        alert(
          document.documentElement.lang === "bg"
            ? "Няма резултати за зададените критерии!"
            : "No results for the selected criteria!",
        )
      }
    })
    .catch((error) => console.error("Грешка при зареждане на JSON:", error))
})

searchBtn2.addEventListener("click", () => {
  const descriptionSearch = document.getElementById("descriptionSearch").value.toLowerCase().trim()

  fetch("dates.json")
    .then((response) => response.json())
    .then((data) => {
      filteredData = data.filter((item) => {
        const matchesText =
          descriptionSearch === "" ||
          item.description_bg.toLowerCase().includes(descriptionSearch) ||
          item.description_en.toLowerCase().includes(descriptionSearch)

        return matchesText
      })

      if (filteredData.length > 0) {
        datesData = filteredData
        currentIndex = 0
        renderCarousel()
        startAutoSlide()
        showFilterSuccess()
      } else {
        alert(
          document.documentElement.lang === "bg"
            ? "Няма резултати за зададените критерии!"
            : "No results for the selected criteria!",
        )
      }
    })
    .catch((error) => console.error("Грешка при зареждане на JSON:", error))
})

resetFilter.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false
    playPauseButton.style.backgroundColor = "#00966e"
    playIco.style.display = "none"
    pauseIco.style.display = "flex"
  }

  if (filteredData.length > 0) {
    document.getElementById("startYear").value = ""
    document.getElementById("endYear").value = ""
    document.getElementById("yearSearch").value = ""
    document.getElementById("descriptionSearch").value = ""
    speedSlider.value = 6

    fetch("dates.json")
      .then((response) => response.json())
      .then((data) => {
        datesData = data
        currentIndex = 0
        renderCarousel()
        startAutoSlide()
        updateSlideWidths()
        resetInactivityTimer()
        updateCaption()

        const notification = document.createElement("div")
        notification.className = "filter-notification"
        notification.innerHTML = document.documentElement.lang === "bg" ? "Филтърът е изчистен!" : "Filter cleared!"

        notification.style.position = "fixed"
        notification.style.bottom = "20px"
        notification.style.left = "50%"
        notification.style.transform = "translateX(-50%)"
        notification.style.backgroundColor = "#d62612"
        notification.style.color = "white"
        notification.style.padding = "10px 20px"
        notification.style.borderRadius = "30px"
        notification.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
        notification.style.zIndex = "9999"
        notification.style.opacity = "0"
        notification.style.transition = "all 0.5s ease"

        document.body.appendChild(notification)

        setTimeout(() => {
          notification.style.opacity = "1"
        }, 100)

        setTimeout(() => {
          notification.style.opacity = "0"
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 500)
        }, 3000)
      })
      .catch((error) => console.error("Грешка при зареждане на JSON:", error))
  } else {
    document.getElementById("startYear").value = ""
    document.getElementById("endYear").value = ""
    document.getElementById("yearSearch").value = ""
    document.getElementById("descriptionSearch").value = ""
    speedSlider.value = 6
  }
})

// -------- CAROUSEL --------- //

function moveNext() {
  currentIndex = (currentIndex + 1) % datesData.length
  renderCarousel()
}

function movePrev() {
  currentIndex = (currentIndex - 1 + datesData.length) % datesData.length
  renderCarousel()
}

function filterDatesByYearRange() {
  let startYear = document.getElementById("startYear").value
  let endYear = document.getElementById("endYear").value

  startYear = startYear === "" ? null : Number.parseInt(startYear)
  endYear = endYear === "" ? null : Number.parseInt(endYear)

  fetch("dates.json")
    .then((response) => response.json())
    .then((data) => {
      filteredData = data.filter((item) => {
        const year = getYearFromDateString(item.date)
        let inRange = true
        if (startYear !== null && endYear !== null) {
          inRange = year >= startYear && year <= endYear
        } else if (startYear !== null) {
          inRange = year >= startYear
        } else if (endYear !== null) {
          inRange = year <= endYear
        }

        return inRange
      })

      if (filteredData.length > 0) {
        datesData = filteredData
        currentIndex = 0
        renderCarousel()
        startAutoSlide()
        showFilterSuccess()
      } else {
        alert(
          document.documentElement.lang === "bg"
            ? "Няма резултати за зададените критерии!"
            : "No results for the selected criteria!",
        )
      }
    })
    .catch((error) => console.error("Грешка при зареждане на JSON:", error))
}

document.querySelectorAll(".period-item").forEach((item) => {
  item.addEventListener("click", () => {
    const selectedId = item.id
    let startDate = ""
    let endDate = ""

    switch (selectedId) {
      case "oldGreatBg":
        startDate = "632"
        endDate = "668"
        break
      case "firstBg":
        startDate = "680"
        endDate = "1018"
        break
      case "secondBg":
        startDate = "1185"
        endDate = "1396"
        break
      case "ottomanRule":
        startDate = "1396"
        endDate = "19 февруари 1878"
        break
      case "natRevival":
        startDate = "1762"
        endDate = "19 февруари 1878"
        break
      case "princedomBg":
        startDate = "19 февруари 1878"
        endDate = "22 септември 1908"
        break
      case "kingdomBg":
        startDate = "22 септември 1908"
        endDate = "15 септември 1946"
        break
      case "socialistBg":
        startDate = "15 септември 1946"
        endDate = "15 ноември 1990"
        break
      case "republicBg":
        startDate = "15 ноември 1990"
        endDate = new Date().getFullYear().toString()
        break
      default:
        startDate = ""
        endDate = ""
        break
    }

    filterDatesByRange(startDate, endDate)
  })
})

// -------- OTHER EVENTS --------- //

function updateTooltipPosition(val) {
  const min = Number(speedSlider.min)
  const max = Number(speedSlider.max)
  const percent = (val - min) / (max - min)

  const sliderWidth = speedSlider.offsetWidth
  const thumbSize = 20
  const offset = thumbSize / 2

  const left = percent * (sliderWidth - thumbSize) + offset

  speedTooltip.textContent = val
  speedTooltip.style.left = `${left}px`
  speedTooltip.style.visibility = "visible"
}

speedSlider.addEventListener("input", (e) => {
  const val = Number(e.target.value)
  updateTooltipPosition(val)
  startAutoSlide()
})

speedSlider.addEventListener("mouseover", () => {
  const val = Number(speedSlider.value)
  updateTooltipPosition(val)
})

speedSlider.addEventListener("mouseleave", () => {
  speedTooltip.style.visibility = "hidden"
})

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(autoSlide)
  else if (!isPaused) startAutoSlide()
})

document.addEventListener("mousemove", resetInactivityTimer)
document.addEventListener("keydown", resetInactivityTimer)
document.addEventListener("click", resetInactivityTimer)

// -------- LANGUAGE SWITCH --------- //

function changeLanguage(lang) {
  const isBG = lang === "bg"
  document.documentElement.lang = lang
  const items = document.querySelectorAll(".period-item")
  const allLabels = document.querySelectorAll("label")

  const periodTranslations = {
    bg: [
      "Стара Велика България (632 - 668 г.)",
      "Първо българско царство (680 - 1018 г.)",
      "Второ българско царство (1185-1396 г.)",
      "Османско владичество (1396 - 1878 г.)",
      "Национално възраждане (1762 - 1878 г.)",
      "Княжество България (1878 - 1908 г.)",
      "Царство България (1908 - 1946 г.)",
      "Народна Република България (1946 - 1990 г.)",
      "Република България (1990 - )",
    ],
    en: [
      "Old Great Bulgaria (632 – 668)",
      "First Bulgarian Empire (680 – 1018)",
      "Second Bulgarian Empire (1185 – 1396)",
      "Ottoman Rule (1396 – 1878)",
      "National Revival (1762 – 1878)",
      "Principality of Bulgaria (1878 – 1908)",
      "Kingdom of Bulgaria (1908 – 1946)",
      "People's Republic of Bulgaria (1946 – 1990)",
      "Republic of Bulgaria (1990 – )",
    ],
  }

  const translations = periodTranslations[lang]
  items.forEach((item, index) => {
    if (translations[index]) {
      item.textContent = translations[index]
    }
  })

  allLabels.forEach((label) => {
    if (label.htmlFor === "startYear") {
      label.textContent = isBG ? "Въведи начална година:" : "Enter start year:"
    } else if (label.htmlFor === "endYear") {
      label.textContent = isBG ? "Въведи крайна година:" : "Enter end year:"
    } else if (
      label.htmlFor === "firstYear" ||
      label.htmlFor === "secondYear" ||
      label.htmlFor === "yearSearch" ||
      label.htmlFor === "descriptionSearch"
    ) {
      label.textContent = isBG ? "Пиши тук ..." : "Write here ..."
    }
  })

  const menuBtnText = document.getElementById("menuBtnText")
  menuBtnText.textContent = isBG ? "Меню" : "Menu"
  menuBtnText.appendChild(chevron)

  document.title = isBG ? "Български исторически дати" : "Bulgarian historical dates"
  document.getElementById("date_range").textContent = isBG ? "Избор на диапазон от години" : "Select year range"
  document.getElementById("periodSelector").textContent = isBG ? "Избор на период от историята на България" : "Select a bulgarian historical period"
  document.getElementById("periodHeader").textContent = isBG ? "Изберете период:" : "Select a period:"
  document.getElementById("dateSeacrh").textContent = isBG ? "Търсене в датите" : "Search in the dates"
  document.getElementById("searchByYearTitle").textContent = isBG ? "Търсене по година:" : "Search by year:"
  document.getElementById("searchByDescriptionTitle").textContent = isBG ? "Търсене по описание:" : "Search by description:"
  document.getElementById("carouselMovement").textContent = isBG ? "Движение на лентата" : "Carousel movement"
  document.getElementById("speedSliderTitle").textContent = isBG ? "Скорост на лентата (в сек.):" : "Timeline speed (sec):"
  document.getElementById("timelinePauseTitle").textContent = isBG ? "Пауза на лентата:" : "Pause timeline:"
  document.getElementById("filterYearRangebtn").textContent = isBG ? "ФИЛТЪР" : "FILTER"
  document.getElementById("searchBtn1").textContent = isBG ? "ФИЛТЪР" : "FILTER"
  document.getElementById("searchBtn2").textContent = isBG ? "ФИЛТЪР" : "FILTER"
  document.getElementById("clearFilter").textContent = isBG ? "Изчисти филтъра" : "Remove the filter"

  if (!isInit) {
    renderCarousel()
  }
}
