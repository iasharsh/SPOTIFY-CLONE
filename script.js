console.log("Welcome to Spotify Clone");

/* ================= GLOBALS ================= */
let users = JSON.parse(localStorage.getItem("users")) || [
    { email: "test@gmail.com", password: "Abc@123" }
];

let currentMode = "login"; // or signup

let currentSong = new Audio();
let currentSongName = "";
let songs = [];
let currfolder = "";

let sections = [];
let currentSectionIndex = 0;

let leftArrow;
let rightArrow;

let allSongsIndex = [];
// [{ name, folder }]

const authModal = document.getElementById("authModal");
const loginBtn = document.querySelector(".logInbtn");
const signupBtn = document.querySelector(".signUpbtn");
const closeAuth = document.getElementById("closeAuth");

const authTitle = document.getElementById("authTitle");
const authSubmit = document.getElementById("authSubmit");
const switchAuth = document.getElementById("switchAuth");
const switchText = document.getElementById("switchText");

const email = document.getElementById("authEmail");
const password = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");

const passwordError = document.getElementById("passwordError");
const authError = document.getElementById("authError");

let isLoggedIn = false; // user is NOT logged in by default

// search songs
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// Open Login
loginBtn.onclick = () => openAuth("login");
signupBtn.onclick = () => openAuth("signup");

// Close
closeAuth.onclick = () => authModal.classList.add("hidden");

// Switch Login / Signup
switchAuth.onclick = () => {
    openAuth(currentMode === "login" ? "signup" : "login");
};

if (authMessage) {
    authMessage.textContent = "";
}

function requireLogin(action) {
    if (!isLoggedIn) {
        openAuth("login");
        return;
    }
    action();
}

function resetAuthForm() {
    email.value = "";
    password.value = "";
    authMessage.textContent = "";

    email.closest(".field").classList.remove("error-active");
    password.closest(".field").classList.remove("error-active");
}



function openAuth(type) {
  authModal.classList.remove("hidden");

  currentMode = type;

  /* 🔥 CLEAR EVERYTHING WHEN SWITCHING */
  authError.textContent = "";
  authError.classList.add("hidden");

  email.value = "";
  password.value = "";

  email.closest(".field").classList.remove("error-active");
  password.closest(".field").classList.remove("error-active", "show-tooltip");

  if (type === "login") {
    authTitle.innerText = "Log In";
    authSubmit.innerText = "Log In";
    switchText.innerText = "Don’t have an account?";
    switchAuth.innerText = "Sign Up";
  } else {
    authTitle.innerText = "Sign Up";
    authSubmit.innerText = "Sign Up";
    switchText.innerText = "Already have an account?";
    switchAuth.innerText = "Log In";
  }

  setTimeout(() => email.focus(), 100);
}




function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(password);
}

// Validation
authSubmit.addEventListener("click", () => {
  const emailVal = email.value.trim();
  const passVal = password.value.trim();

  const emailField = email.closest(".field");
  const passField = password.closest(".field");

  // RESET
  emailField.classList.remove("error-active");
  passField.classList.remove("error-active", "show-tooltip");
  authError.textContent = "";
  authError.classList.add("hidden");

  /* EMAIL */
  if (!isValidEmail(emailVal)) {
    emailField.classList.add("error-active");
    return;
  }

  const user = users.find(u => u.email === emailVal);

  /* ================= LOGIN ================= */
  if (currentMode === "login") {

    if (!user) {
      authError.textContent = "No account exists with this email.";
      authError.classList.remove("hidden");
      return; 
    }

    if (user.password !== passVal) {
      passField.classList.add("error-active");
      authError.textContent = "Wrong password. Please try again.";
      authError.classList.remove("hidden");
      return;
    }

    // SUCCESS
    isLoggedIn = true;
    authModal.classList.add("hidden");
    return;
  }

  /* ================= SIGN UP ================= */
  if (currentMode === "signup") {

    if (user) {
      authError.textContent = "Account already exists. Please log in.";
      authError.classList.remove("hidden");
      return;
    }

    if (!isValidPassword(passVal)) {
      passField.classList.add("error-active", "show-tooltip");
      return;
    }

    users.push({ email: emailVal, password: passVal });
    localStorage.setItem("users", JSON.stringify(users));

    openAuth("login");
  }
});



authPassword.addEventListener("input", () => {
    const field = authPassword.closest(".field");

    // ✅ remove tooltip immediately when user types
    field.classList.remove("show-tooltip");
});

[email, password].forEach(input => {
  input.addEventListener("input", () => {
    input.closest(".field").classList.remove("error-active", "show-tooltip");
    authError.classList.add("hidden");
    authError.textContent = "";
  });
});




passwordError.classList.add("hidden");

function showAuthMessage(msg, success = false) {
    authMessage.textContent = msg;
    authMessage.style.color = success ? "#1db954" : "#e91429";
}



searchBtn.addEventListener("click", () => {
    requireLogin(() => {
        searchInput.classList.remove("hidden");
        searchInput.focus();
    });
});


const cardsContainer = document.querySelector(".cardContainer");
const libraryList = document.querySelector(".songlist ul")

searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    /* ===== FILTER ALBUM CARDS ===== */
    const cards = cardsContainer.querySelectorAll(".card");

    cards.forEach(card => {
        const title = card.querySelector("h2")?.innerText.toLowerCase() || "";
        const desc = card.querySelector("p")?.innerText.toLowerCase() || "";
        card.style.display =
            title.includes(value) || desc.includes(value)
                ? "block"
                : "none";
    });

    /* ===== LOAD SONGS INTO LIBRARY ===== */
    if (value.trim() == "") return;

    const matches = allSongsIndex.filter(song =>
        cleanSongName(song.name).toLowerCase().includes(value)
    );

    libraryList.innerHTML = "";

    matches.forEach(song => {
        const li = document.createElement("li");
        li.innerHTML = `
         <img class="invert" src="img/music.svg">
        <div class="info">
            <div>${cleanSongName(song.name)}</div>
            <div>${song.folder}</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="img/play.svg">
        </div>`;

        li.addEventListener("click", () => {
            currfolder = song.folder;
            playMusic(song.name);
        });

        libraryList.appendChild(li);
    });
});

/* ================= ELEMENTS ================= */
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const volumeSlider = document.getElementById("volumeSlider");
const volumeIcon = document.getElementById("volumeIcon");

const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

/* ================= TIME FORMAT ================= */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function cleanSongName(name) {
    return name
        .replace(/\.mp3$/i, "")
        .replace(/320\s*kbps/i, "")
        .trim();
}


/* ================= FETCH SONGS ================= */
async function getSongs(folder) {
    currfolder = folder;

    const res = await fetch(`songs/${folder}/songs.json`);
    const data = await res.json();
    songs = data.songs;

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    songs.forEach(song => {
        songUl.innerHTML += `
        <li class="songItem" data-song="${song}">
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${cleanSongName(song)}</div>
                <div>Harsh</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    });

    Array.from(songUl.children).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.dataset.song);
        });
    });

    return songs;
}

/* ================= PLAY MUSIC ================= */
function playMusic(track, pause = false) {
    if (!track) return;

    if (!pause) activatePlayerUI();

    currentSongName = track;
    currentSong.src = `songs/${currfolder}/${encodeURIComponent(track)}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = cleanSongName(track);
}




/* ================= SEEK BAR ================= */
let isDragging = false;

function seekTo(clientX) {
    const rect = seekbar.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    const percent = offsetX / rect.width;
    circle.style.left = `${percent * 100}%`;
    currentSong.currentTime = percent * currentSong.duration;
}

/* mouse */
circle.addEventListener("mousedown", e => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    seekTo(e.clientX);
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

/* touch */
circle.addEventListener("touchstart", e => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener("touchmove", e => {
    if (!isDragging) return;
    seekTo(e.touches[0].clientX);
});

document.addEventListener("touchend", () => {
    isDragging = false;
});

/* click anywhere on bar */
seekbar.addEventListener("click", e => {
    const percent = e.offsetX / seekbar.clientWidth;
    currentSong.currentTime = percent * currentSong.duration;
});

function activatePlayerUI() {
    // show library
    document.querySelector(".library").classList.add("active");

    // show playbar
    document.querySelector(".playbar").classList.add("active");

    // show Your Library section
    document.querySelector(".library").classList.add("active");
}



/* ================= ALBUMS ================= */
async function displayAlbums() {
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    // fetch album list
    const res = await fetch("songs/albums.json");
    const albumData = await res.json();
    const albums = albumData.albums;

    for (let folder of albums) {
        const albumRes = await fetch(`songs/${folder}/songs.json`);
        const data = await albumRes.json();

        cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
                    <circle cx="25" cy="25" r="25" fill="#1DB954"/>
                    <path d="M31.5 25c0 1.2-.7 2-2.1 2.9l-6.8 3.9c-1.3.7-2.4.4-2.9-.6-.2-.4-.2-.8-.2-6.2s0-5.8.2-6.2c.5-1 1.6-1.3 2.9-.6l6.8 3.9c1.4.9 2.1 1.7 2.1 2.9z" fill="black"/>
                </svg>
            </div>
            <img src="songs/${folder}/cover.jpg">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`;
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            requireLogin(async () => {
                const songs = await getSongs(card.dataset.folder);
                playMusic(songs[0]);
            });
        });

    });
}

// arrows function
function updateArrowState() {
    leftArrow.style.opacity = currentSectionIndex === 0 ? "0.3" : "1";
    rightArrow.style.opacity =
        currentSectionIndex === sections.length - 1 ? "0.3" : "1";
}


// sections loader
async function loadSections() {
    const res = await fetch("songs/sections.json");
    const data = await res.json();
    sections = data.sections;

    allSongsIndex = [];

    for (const section of sections) {
        for (const folder of section.folders) {
            const songRes = await fetch(`songs/${folder}/songs.json`);
            const songData = await songRes.json();

            songData.songs.forEach(song => {
                allSongsIndex.push({
                    name: song,
                    folder: folder
                });
            });
        };
    };
};


const homeBtn = document.getElementById("homeBtn");

homeBtn.addEventListener("click", () => {
    /* 1️⃣ Reset search */
    searchInput.value = "";
    searchInput.classList.add("hidden");

    /* 2️⃣ Clear library search results */
    libraryList.innerHTML = "";

    /* 3️⃣ Reset section */
    currentSectionIndex = 0;
    renderCurrentSection();

    /* 4️⃣ Show all cards (safety reset) */
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = "block";
    });
});


// changing of sections
async function renderCurrentSection() {
    const section = sections[currentSectionIndex];
    const cardContainer = document.querySelector(".cardContainer");

    // update heading
    document.querySelector(".spotifyPlaylists h1").innerText = section.title;

    cardContainer.innerHTML = "";

    for (const folder of section.folders) {
        const res = await fetch(`songs/${folder}/songs.json`);
        const data = await res.json();

        cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
                    <circle cx="25" cy="25" r="25" fill="#1DB954"/>
                    <path d="M31.5 25c0 1.2-.7 2-2.1 2.9l-6.8 3.9c-1.3.7-2.4.4-2.9-.6-.2-.4-.2-.8-.2-6.2s0-5.8.2-6.2c.5-1 1.6-1.3 2.9-.6l6.8 3.9c1.4.9 2.1 1.7 2.1 2.9z" fill="black"/>
                </svg>
            </div>
            <img src="songs/${folder}/cover.jpg">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`;
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            requireLogin(async () => {
                const songs = await getSongs(card.dataset.folder);
                playMusic(songs[0]);
            });
        });

    });

    updateArrowState();
}



/* ================= MAIN ================= */
async function main() {
    // songs = await getSongs("c1");
    // playMusic(songs[0], true);
    await loadSections();
    renderCurrentSection();


    play.addEventListener("click", () => {
        requireLogin(() => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        });
    });


    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        circle.style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    previous.addEventListener("click", () => {
        const index = songs.indexOf(currentSongName);
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        const index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    currentSong.addEventListener("ended", () => {
        const index = songs.indexOf(currentSongName);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    /* volume */
    volumeSlider.addEventListener("input", () => {
        const v = volumeSlider.value / 100;
        currentSong.volume = v;

        if (v === 0) volumeIcon.src = "img/VolumeMute02Icon.svg";
        else if (v < 0.4) volumeIcon.src = "img/VolumeLowIcon.svg";
        else volumeIcon.src = "img/VolumeHighIcon.svg";
    });

    volumeIcon.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.src = "img/VolumeOffIcon.svg";
        } else {
            currentSong.volume = 1;
            volumeSlider.value = 100;
            volumeIcon.src = "img/VolumeHighIcon.svg";
        }
    });

    /* mobile menu */
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // arrows functionality
    const arrows = document.querySelectorAll(".arrow");
    leftArrow = arrows[0];
    rightArrow = arrows[1];


    leftArrow.addEventListener("click", () => {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            renderCurrentSection();
        }
    });

    rightArrow.addEventListener("click", () => {
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            renderCurrentSection();
        }
    });
}

main();
