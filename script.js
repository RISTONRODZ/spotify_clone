let currentFolder = "happy";
let songs = [];
let currentAudio = null;
let play = document.querySelector("#play");

const playlists = {
  happy: [
    "Boom Kitty, TOKYO MACHINE, Warriyo - Mortals (TOKYO MACHINE & Boom Kitty Remix) [NCS Release].mp3",
    "Chime, Teminite - Duckstep [NCS Release].mp3",
    "Drama B, SKAN - Muscle Up (feat. Drama B & Ryo) [NCS Release].mp3",
    "No Hero, Tatsunoshin - All Or Nothing [NCS Release].mp3"
  ],
  "Chill_(mood)": [
    "Boom Kitty, TOKYO MACHINE, Warriyo - Mortals (TOKYO MACHINE & Boom Kitty Remix) [NCS Release].mp3",
    "Chime, Teminite - Duckstep [NCS Release].mp3",
    "Drama B, SKAN - Muscle Up (feat. Drama B & Ryo) [NCS Release].mp3"
  ],
  "Dark_(mood)": [
    "Joyful, Фрози, Zachz Winner - Boogie [NCS Release].mp3",
    "Maestro Chives, Egzod, Neoni - Royalty [NCS Release].mp3",
    "NIVIRO - Dancinfloor Dreamer [NCS Release].mp3"
  ],
  cs: [
    "PhiloSofie, Azertion, JJD - Lighthouse (feat. PhiloSofie) [NCS Release].mp3",
    "Warriyo - Dunes [NCS Release].mp3",
    "Warriyo, LXNGVX - Mortals Funk Remix [NCS Release].mp3"
  ]
};

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function cleanSongName(file) {
  return decodeURIComponent(file).replace(/\.mp3$/i, "");
}

function playMusic(songName) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  play.src = "img/pause.svg";

  const file = encodeURIComponent(songName + ".mp3");
 const url = `./${encodeURIComponent(currentFolder)}/${file}`;

  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});

  document.querySelector(".songinfo").innerHTML = songName;
  document.querySelector(".songtime").innerHTML = "00:00/00:00";

  currentAudio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentAudio.currentTime)}|${formatTime(currentAudio.duration)}`;

    document.querySelector(".circle").style.left =
      (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });
}

function loadFolder(folder) {
  currentFolder = folder;

  songs = playlists[folder].map(s => ({
    name: cleanSongName(s),
    file: s
  }));

  const songul = document.querySelector(".songlist ul");
  songul.innerHTML = "";

  songs.forEach((song, i) => {
    songul.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg">
        <div class="info">
          <div>${song.name}</div>
        </div>
        <img class="invert" src="img/play.svg">
      </li>
    `;
  });

  document.querySelectorAll(".songlist li").forEach((e, i) => {
    e.addEventListener("click", () => {
      playMusic(songs[i].name);
    });
  });

  if (songs.length > 0) {
    playMusic(songs[0].name);
  }
}

play.addEventListener("click", () => {
  if (!currentAudio) return;

  if (currentAudio.paused) {
    currentAudio.play();
    play.src = "img/pause.svg";
  } else {
    currentAudio.pause();
    play.src = "img/play.svg";
  }
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  if (currentAudio) {
    currentAudio.currentTime = (currentAudio.duration * percent) / 100;
  }
});

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-100%";
});

document.querySelector("#previous").addEventListener("click", () => {
  if (!currentAudio) return;

  let index = songs.findIndex(s => s.name === cleanSongName(currentAudio.src.split("/").pop()));

  if (index > 0) playMusic(songs[index - 1].name);
});

document.querySelector("#next").addEventListener("click", () => {
  if (!currentAudio) return;

  let index = songs.findIndex(s => s.name === cleanSongName(currentAudio.src.split("/").pop()));

  if (index !== -1) {
    let next = (index + 1) % songs.length;
    playMusic(songs[next].name);
  }
});

document.querySelector(".range input").addEventListener("input", (e) => {
  if (currentAudio) {
    currentAudio.volume = e.target.value / 100;
  }
});

const cardContainer = document.getElementById("cardContainer");

const playlistData = [
  {
    name: "Happy Hits!",
    description: "Hits to boost your mood",
    image: "cover/happy.jpg",
    folder: "happy"
  },
  {
    name: "Lofi Chill",
    description: "Relaxing beats",
    image: "cover/chill.jpg",
    folder: "Chill_(mood)"
  },
  {
    name: "Rock Anthems",
    description: "High energy rock",
    image: "cover/dark.jpg",
    folder: "Dark_(mood)"
  }
];

playlistData.forEach(p => {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <div class="play"></div>
    <img src="${p.image}">
    <h2>${p.name}</h2>
    <p>${p.description}</p>
  `;

  card.addEventListener("click", () => {
    loadFolder(p.folder);
  });

  cardContainer.appendChild(card);
});

loadFolder("happy");