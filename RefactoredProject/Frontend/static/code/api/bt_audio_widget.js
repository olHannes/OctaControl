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
    }


    /**
     * Initial function
     * -> renders the content
     * -> setup Listeners
     */
    connectedCallback() {
        this.render();
        this.setupListeners();
    }


    /**
     * enables / disables the clickable buttos -> used to limit user inputs
     */
    toggleButtons(activate=false){

    }


    /**
     * calls the GET-/all api and call the updateUI function
     * @return: returns the received metadata 
     */
    async update(){
        try {
            
        } catch (error) {
            
        }
    }


    /**
     * play Track
     */
    async play(){
        try {
            
        } catch (error) {
            
        }
    }


    /**
     * pause Track
     */
    async pause(){
        try {
            
        } catch (error) {
            
        }
    }


    /**
     * Go to next Track
     */
    async skip(){
        try {
            
        } catch (error) {
            
        }
    }


    /**
     * Go to previous Track
     */
    async previous(){
        try {
            
        } catch (error) {
            
        }
    }


    /**
     * updates the widget based on the metadata
     */
    updateUI(pMeta){

    }

    
    /**
     * setup Listeners
     * sets all listeners to the different buttons and to the keyboard
     */
    setupListeners(){
        const root = this.shadowRoot;

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
                    
                }

            </style>
        `;

        const pHTML = `
            <div class="audio-widget">
                <h3>Audio</h3>
            </div>
        `;

        this.shadowRoot.innerHTML = pStyle + pHTML;
    }
}


customElements.define("bt-audio-widget", BluetoothAudioWidget);
