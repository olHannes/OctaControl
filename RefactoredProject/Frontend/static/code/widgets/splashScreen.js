//code/widgets/splashScreen.js

import {save, load, StorageKeys } from '../utils/storage_handler.js';

class SplashScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
            height: 100%;
            width: 100%;
            background: white;
            font-family: "Poppins", sans-serif;
            overflow: hidden;
        }

        #splash {
            position: fixed;
            inset: 0;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            overflow: hidden;
        }

        .logo {
            width: 200px;
            opacity: 0;
        }

        .title {
            display: flex;
            margin-top: 30px;
            font-size: 5.5rem;
            font-weight: 600;
            color: #003521;
            z-index: 2;
        }

        .title span {
            display: inline-block;
            opacity: 0;
            transform: translateY(100%);
        }

        /* Keyframes */
        @keyframes logoDrop {
            0% { transform: translateY(-250%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes letterUp {
            to { opacity: 1; transform: translateY(0); }
        }

        .lines {
            position: absolute;
            inset: 0;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 25px;
            justify-content: center;
            z-index: 0;
            opacity: 0;
        }

        .line {
            height: 3px;
            width: 0%;
            background: #005d3a;
            margin: auto;
            border-radius: 50%;
            transform: skewX(20deg);
            animation: lineGrow 1.2s ease forwards;
        }

        @keyframes lineGrow {
            0% { width: 0%; opacity: 0; }
            50% { width: 70%; opacity: 1; background-color: rgb(0, 0, 0); }
            100% { width: 0%; opacity: 0; }
        }

        </style>

        <div id="splash">
            <img src="../static/media/skoda_logo.svg" alt="Skoda Logo" class="logo">
            <div class="title">
            <span>O</span><span>C</span><span>T</span><span>A</span><span>V</span><span>I</span><span>A</span>
            </div>
            <div class="lines"></div>
        </div>
    `;
  }

  connectedCallback() {
    const splash = this.shadowRoot.getElementById("splash");
    const logo = this.shadowRoot.querySelector(".logo");
    const letters = this.shadowRoot.querySelectorAll(".title span");
    const linesContainer = this.shadowRoot.querySelector(".lines");

    const enabled = load("WELCOME_SOUND");
    const volume = load("WELCOME_VOLUME") ?? 50;
    const audio = new Audio("../static/sounds/startup.mp3");

    splash.addEventListener("click", () => {
        if(enabled){
            audio.volume = volume / 100;
            audio.play();
        }      

        setTimeout(() => {
        logo.style.animation = "logoDrop 1.5s ease forwards";
        letters.forEach((letter, i) => {
            letter.style.animation = `letterUp 0.6s ease forwards`;
            letter.style.animationDelay = `${1 + i * 0.2}s`;
        });

        setTimeout(() => {
            for (let i = 0; i < 6; i++) {
                const line = document.createElement("div");
                line.className = "line";
                line.style.animationDelay = `${i * 0.1}s`;
                linesContainer.appendChild(line);
            }
            linesContainer.style.opacity = "1";
        }, 3000);

        setTimeout(() => {
            const screen = document.querySelector("splash-screen");
            if(screen){
                screen.style.transition = "opacity 1s ease";
                screen.style.opacity = "0";
                setTimeout(() => document.querySelector("splash-screen").style.display="none", 1500);
            }
            setTimeout(() => splash.style.display = "none", 1000);
        }, 4000);
        }, 10);
    });
    }
}

customElements.define("splash-screen", SplashScreen);
