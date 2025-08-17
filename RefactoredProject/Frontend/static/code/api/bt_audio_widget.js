// code/api/wifi_controller_widget.js

class BluetoothAudioWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.apiPath = "http://127.0.0.1:5000";

        this.audioApis = {
            "all": `${this.apiPath}/api/bluetooth/metadata/all`,
            "play": `${this.apiPath}/api/bluetooth/control/play`,
            "pause": `${this.apiPath}/api/bluetooth/control/pause`,
            "skip": `${this.apiPath}/api/bluetooth/control/skip`,
            "previous": `${this.apiPath}/api/bluetooth/control/previous`,
        };

        this.btnPrev = null;
        this.btnNext = null;
        this.btnPlayPause = null;
        this.pProgressBar = null;
        this.pCover = null;
        this.pTitle = null;
        this.pArtist = null;

        this.updateIntervall = null;
    }


    /**
     * Initial function
     * -> renders the content
     * -> setup Listeners
     */
    connectedCallback() {
        this.render();
        this.setupElements();
        this.setupListeners();
    }


    /**
     * toggle buttons
     * enables / disables the clickable buttos -> used to limit user inputs
     */
    toggleButtons(activate=false){
        this.btnPrev.disabled = activate;
        this.btnNext.disabled = activate;
        this.btnPlayPause.disabled = activate;

        this.shadowRoot.querySelector(".audio-widget").classList.add("loading");
        setTimeout(() => {
            this.shadowRoot.querySelector(".audio-widget").classList.remove("loading");
        }, 1000);
    }


    /**
     * update
     * calls the GET-/all api and call the updateUI function
     * @return: returns the received metadata 
     */
    async update(){
        try {
            const res = await fetch(`${this.audioApis.all}`, {method: "GET"});
            if(!res.ok) throw new Error("Failed to call /all api");

            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            this.updateUI(data);

        } catch (error) {
            console.error(error);
        }
    }


    /**
     * togglePlay
     * plays or pauses the current track
     */
    async togglePlay() {
        try {
            const action = this.btnPlayPause.dataset.playing === "true" ? "pause" : "play";
            const res = await fetch(this.audioApis[action], { method: "POST" });
            if (!res.ok) throw new Error(`Failed to ${action} track`);
            await this.update();
        } catch (error) {
            console.error(error);
        } finally {
            this.toggleButtons(false);
        }
    }



    /**
     * next
     * Go to next Track
     */
    async skip(){
        try {
            const res = await fetch(this.audioApis.skip, { method: "POST" });
            if (!res.ok) throw new Error("Failed to skip track");
            await this.update();
        } catch (error) {
            console.error(error);
        } finally {
            this.toggleButtons(false);
        }
    }


    /**
     * previous
     * Go to previous Track
     */
    async previous(){
        try {
            const res = await fetch(this.audioApis.previous, { method: "POST" });
            if (!res.ok) throw new Error("Failed to play previous track");
            await this.update();
        } catch (error) {
            console.error(error);
        } finally {
            this.toggleButtons(false);
        }
    }


    /**
     * update UI
     * updates the widget based on the metadata
     */
    updateUI(pMeta){
        const device = pMeta.device || "Unbekannt";
        const is_playing = pMeta.is_playing || false;
        const progress = pMeta.progress || 0;
        const title = pMeta.title || "-";
        const artist = pMeta.artist || "-";
        const album = pMeta.album || "-";

        if(is_playing == true){
            this.btnPlayPause.dataset.playing = "true";
            this.btnPlayPause.querySelector("img").src = "../static/media/pause.svg";
        } else {
            this.btnPlayPause.dataset.playing = "false";
            this.btnPlayPause.querySelector("img").src = "../static/media/play.svg";
        }
        this.pProgressBar.style.width = `${progress}%`;
        
        this.pTitle.innerText = title;
        this.pArtist.innerText = artist;
    }

    
    /**
     * setup Elements
     * sets all the global items
     */
    setupElements(){
        const root = this.shadowRoot;
        this.btnPrev = root.querySelector("#prev");
        this.btnNext = root.querySelector("#next");
        this.btnPlayPause = root.querySelector("#play-pause");
        this.pProgressBar = root.querySelector("#progress-bar");
        this.pCover = root.querySelector("#cover");
        this.pTitle = root.querySelector("#title");
        this.pArtist = root.querySelector("#artist");
    }


    /**
     * setup Listeners
     * sets all listeners to the different buttons and to the keyboard
     */
    setupListeners(){
        this.btnPrev.addEventListener("click", () => {
            this.toggleButtons(true);
            this.previous();
        });

        this.btnNext.addEventListener("click", () => {
            this.toggleButtons(true);
            this.skip();
        });

        this.btnPlayPause.addEventListener("click", () => {
            this.toggleButtons(true);
            this.togglePlay();
        });

        this.updateIntervall = setInterval(() => {
            this.update();
        }, 1000);
    }


    /**
     * render
     * setup the html and css structure
     */
    render() {
        const pStyle = `
            <style>
                :host {
                    display: block;
                    width: 100%;  
                    max-width: 750px;
                    margin: 0 auto;
                }

                .audio-widget {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 15px;
                    overflow: hidden;
                    color: white;
                    font-family: Arial, sans-serif;
                    background-color: #222;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 20px 25px;
                    box-sizing: border-box;
                }

                .cover {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 100%;
                    height: 100%;
                    background-image: url("../static/media/audio_placeholder.png");
                    background-position: top center;
                    background-size: cover;
                    filter: brightness(0.7);
                    pointer-events: none;
                    transform: translateX(-50%);
                    z-index: 0;
                    mask-image: radial-gradient(circle at top center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 69%);
                    -webkit-mask-image: radial-gradient(circle at top center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 69%);
                }

                .info-controls {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .info {
                    max-width: 60%;
                }

                .title {
                    font-size: 1.6rem;
                    font-weight: bold;
                    margin-bottom: 6px;
                    text-shadow: 0 0 5px rgba(0,0,0,0.7);
                }

                .artist {
                    font-size: 1.1rem;
                    opacity: 0.8;
                    text-shadow: 0 0 5px rgba(0,0,0,0.7);
                }

                .play-pause button {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    font-size: 1.8rem; /* kleiner */
                    padding: 8px 14px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    margin-left: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                }

                .play-pause button:hover {
                    background: rgba(255,255,255,0.4);
                }

                .bottom-controls {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 12px;
                }

                .bottom-controls button {
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    padding: 6px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bottom-controls button:hover {
                    background: rgba(255,255,255,0.4);
                }

                #next img {
                    transform: scaleX(-1);
                }

                .progress-bar-container {
                    flex-grow: 1;
                    height: 10px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 5px;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    width: 40%;
                    background: #1db954;
                    border-radius: 5px 0 0 5px;
                    transition: width 0.2s ease;
                }
            </style>
        `;

        const pHTML = `
            <div class="audio-widget">
                <div class="cover" id="cover"></div>
                <div class="info-controls">
                    <div class="info">
                    <div class="title" id="title">Title wird geladen...</div>
                    <div class="artist" id="artist">Interpret</div>
                    </div>
                    <div class="play-pause">
                    <button id="play-pause" title="Play">
                        <img src="../static/media/play.svg" alt="Play" width="24" height="24" />
                    </button>
                    </div>
                </div>

                <div class="bottom-controls">
                    <button id="prev" title="Vorheriger">
                        <img src="../static/media/previous.svg" alt="Previous" width="20" height="20" />
                    </button>
                    <div class="progress-bar-container" aria-label="Fortschritt Lied">
                    <div class="progress-bar" id="progress-bar"></div>
                    </div>
                    <button id="next" title="Nächster">
                        <img src="../static/media/previous.svg" alt="Skip" width="20" height="20" />
                    </button>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
    }
}


customElements.define("bt-audio-widget", BluetoothAudioWidget);
