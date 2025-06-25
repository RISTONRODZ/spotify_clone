let currentFolder = "happy";
        console.log("let's write javascript");
        let songs = "";
        let currentAudio = null;
        let play = document.querySelector("#play")
        async function getSongs() {
            const res = await fetch("http://127.0.0.1:5500/spotify/happy");
            const html = await res.text();

            // Parse fetched HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Now query the remote page's DOM
            const links = doc.querySelectorAll('#files a');
            const songs = Array.from(links)
                .filter(a => a.textContent.trim() !== '..')
                .map(a => ({
                    name: a.textContent.trim(),
                    url: a.href
                }));

            return songs;
        }
        const playMusic = (songName) => {
            // Stop any currently playing song
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            play.src = "img/pause.svg"
            const fullFileName = encodeURIComponent(songName + ".mp3");
            // Use currentFolder instead of hardcoded "happy"
            const url = `http://127.0.0.1:5500/spotify/${currentFolder}/${fullFileName}`;
            currentAudio = new Audio(url);

            currentAudio.play().then(() => {
                console.log("Playing:", songName);
            }).catch(err => {
                console.error("Playback failed:", err);
            });
            document.querySelector(".songinfo").innerHTML = songName
            document.querySelector(".songtime").innerHTML = "00/00"
            currentAudio.addEventListener("timeupdate", (a) => {
                document.querySelector(".songtime").innerHTML = `${formatTime(currentAudio.currentTime)}|${formatTime(currentAudio.duration)}`
                document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%"
            })
        };
        function formatTime(seconds) {
            if (isNaN(seconds)) return "00:00";
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        function cleanSongName(fileUrl) {
            const rawName = fileUrl.split('/').pop().replace(/\.mp3$/i, '');
            return decodeURIComponent(rawName);
        }

        async function fetchSongsFromFolder(folder) {
            currentFolder = folder;
            const res = await fetch(`http://127.0.0.1:5500/spotify/${folder}`);
            const html = await res.text();

            // Parse fetched HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Query the remote page's DOM for song links
            const links = doc.querySelectorAll('#files a');
            songs = Array.from(links)
                .filter(a => a.textContent.trim() !== '..')
                .map(a => ({
                    name: a.textContent.trim(),
                    url: a.href
                }));

            // Update the song list UI
            const songul = document.querySelector(".songlist ul");
            songul.innerHTML = ""; // Clear previous songs
            for (const song of songs) {
                const filename = decodeURIComponent(song.url.split('/').pop());
                const cleanName = filename.replace(/\.mp3$/i, '');

                // Inside fetchSongsFromFolder and main, replace the songul.innerHTML += ... with:

                songul.innerHTML = `
    <li class="static-header">
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>Song Name</div>
        </div>
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
    </li>
`; // Add static header

                for (const song of songs) {
                    const filename = decodeURIComponent(song.url.split('/').pop());
                    const cleanName = filename.replace(/\.mp3$/i, '');

                    songul.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${cleanName}</div>
            </div>
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="Play">
        </li>
    `;
                }
            }
            // Add click listeners to new song items
            Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
                e.addEventListener("click", () => {
                    const songName = e.querySelector(".info > div").textContent.trim();
                    playMusic(songName);
                });
            });

            // Play the first song in the new folder
            if (songs.length > 0) {
                const firstCleanName = cleanSongName(songs[0].url);
                playMusic(firstCleanName);
            }
        }

        async function main() {

            songs = await getSongs()
            console.log(songs);
            var audio = new Audio(songs[0].url);
            const firstCleanName = cleanSongName(songs[0].url);
            playMusic(firstCleanName);
            play.src = "img/play.svg";

            songul = document.querySelector(".songlist ul")
            for (const song of songs) {
                const filename = decodeURIComponent(song.url.split('/').pop());
                const cleanName = filename.replace(/\.mp3$/i, '');

                songul.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${cleanName}</div>
            </div>

            <img class="invert" src="img/play.svg" alt="Play">
        </li>
    `;
            }
            Array.from(document.querySelectorAll(".songlist li")
            ).forEach(e => {
                e.addEventListener("click", () => {
                    const songName = e.querySelector(".info > div").textContent.trim();
                    playMusic(songName);
                    console.log(songName);

                });
            });
            // audio.pause()

        }
        play.addEventListener("click", () => {
            if (!currentAudio) return; // No song has been played yet

            if (currentAudio.paused) {
                currentAudio.play();
                play.src = "img/pause.svg";
            } else {
                currentAudio.pause();
                play.src = "img/play.svg";
            }

        });
        //seekbar event listener
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
            document.querySelector(".circle").style.left = percent + "%";
            currentAudio.currentTime = (currentAudio.duration) * percent / 100
        })
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0"
        })
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-100%"
        })
        main()
        document.querySelector("#previous").addEventListener("click", () => {
            if (!currentAudio) return;

            let rawFilename = currentAudio.src.split("/").pop(); // Get the file name
            let currentCleanName = cleanSongName(rawFilename);   // Clean the name

            let cleanSongNames = songs.map(song => cleanSongName(song.url)); // All clean names
            let index = cleanSongNames.indexOf(currentCleanName);

            if (index > 0) {
                const prevCleanName = cleanSongName(songs[index - 1].url);
                playMusic(prevCleanName);
            }
        });

        document.querySelector("#next").addEventListener("click", () => {
            if (!currentAudio) return;

            let rawFilename = currentAudio.src.split("/").pop();
            let currentCleanName = cleanSongName(rawFilename);

            let cleanSongNames = songs.map(song => cleanSongName(song.url));
            let currentIndex = cleanSongNames.indexOf(currentCleanName);

            if (currentIndex !== -1) {
                let nextIndex = (currentIndex + 1) % songs.length;
                const nextCleanName = cleanSongName(songs[nextIndex].url);
                playMusic(nextCleanName);
            } else {
                console.log("Current song not found for next button. Playing first song.");
                if (songs.length > 0) {
                    const firstCleanName = cleanSongName(songs[0].url);
                    playMusic(firstCleanName);
                }
            }
        });

        document.querySelector(".range input").addEventListener("input", (e) => {
            const volume = parseFloat(e.target.value);
            const newVolume = volume / 100
            if (currentAudio && !isNaN(currentAudio.duration)) {
                currentAudio.volume = newVolume;
            }
        })
        const playlists = [
            {
                name: "Happy Hits!",
                description: "Hits to boost your mood and fill you with...",
                image: "cover/happy.jpg",
                folder: "cs"
            },
            {
                name: "Lofi Chill",
                description: "Relax and study with these lofi tracks...",
                image: "cover/chill.jpg",
                folder: "chill_(mood)"
            },
            {
                name: "Rock Anthems",
                description: "Guitar legends and epic rock songs...",
                image: "cover/dark.jpg",
                folder: "dark_(mood)"
            },

        ];

        const cardContainer = document.getElementById("cardContainer");

        playlists.forEach(playlist => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("data-folder", playlist.folder);

            card.innerHTML = `
        <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"
                color="#000000" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ffffff" stroke-width="2" fill="#1DB954"></circle>
                <path
                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                    fill="#000000"></path>
            </svg>
        </div>
        <img src="${playlist.image}" alt="">
        <h2>${playlist.name}</h2>
        <p>${playlist.description}</p>
    `;

            cardContainer.appendChild(card);

            card.addEventListener("click", () => {
                fetchSongsFromFolder(playlist.folder);
                console.log('card clicked');

            });
        });
