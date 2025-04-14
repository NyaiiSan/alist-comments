import { createApp } from 'vue'
import App from './App.vue'
import './assets/chStyle.css'

async function commentsMain() {
    // 等待直到找到目标元素
    const waitForElement = (selector) => {
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    };

    const objBoxElement = await waitForElement(".title");
    const bodyElement = document.querySelector(".body");

    if (bodyElement) {
        const commentBox = document.createElement("div");
        commentBox.id = "comment";
        commentBox.classList.add("comment-box");
        bodyElement.appendChild(commentBox);
        createApp(App).mount('#comment');
    }
}

commentsMain();

async function fetchConfig() {
    const response = await fetch('/resource/chstyle.json');
    if (!response.ok) {
        console.error('Failed to fetch configuration:', response.statusText);
        return {};
    }
    return response.json();
}

async function chStyle() {
    const styleConfig = await fetchConfig();
    const color = styleConfig.mainColor || "transparent";
    const backgroundImg = styleConfig.backgroundImg;
    const backgroundPosition = styleConfig.backgroundPosition;

    const styleConfigs = {
        breadcrumb: { background: "transparent" },
        box: {
            'background-color': color,
            'backdrop-filter': 'blur(15px)',
            '-webkit-backdrop-filter': 'blur(15px)'
        },
        text: {
            'background-color': '#ffffff88',
            'backdrop-filter': 'blur(15px)',
            '-webkit-backdrop-filter': 'blur(15px)'
        }
    };

    function setBackgroundImg(bg) {
        if (!backgroundImg || !backgroundPosition) return;

        const aspectRatio = window.innerWidth / window.innerHeight;
        if (aspectRatio <= 9 / 16) {
            bg.style.backgroundImage = `url(${backgroundImg.horizontal})`;
            bg.style.backgroundPosition = backgroundPosition.horizontal;
        }
        else {
            bg.style.backgroundImage = `url(${backgroundImg.vertical})`;
            bg.style.backgroundPosition = backgroundPosition.vertical;
        }
    }

    async function applyStyles(selector, styles, asyncMode = false, sleep = 100) {
        while (true) {
            const element = document.querySelector(selector);
            if (element) {
                Object.entries(styles).forEach(([key, value]) => {
                    element.style.setProperty(key, value);
                });
                if (!asyncMode) break;
            }
            await new Promise(resolve => setTimeout(resolve, sleep));
        }
    }

    async function setStyle() {
        const bg = document.createElement("div");
        bg.id = "bg";
        document.body.appendChild(bg);
        setBackgroundImg(bg);

        await applyStyles('.hope-c-PJLV-idaeksS-css', styleConfigs.breadcrumb);
        await applyStyles('.hope-c-PJLV-ikaMhsQ-css', styleConfigs.breadcrumb);

        await applyStyles('.hope-c-PJLV-igScBhH-css', styleConfigs.box);
        applyStyles('.hope-c-PJLV-ijgzmFG-css', styleConfigs.box, true);
        applyStyles('.hope-c-PJLV-iSMXDf-css', styleConfigs.box, true);

        applyStyles('.hope-c-PJLV-ikSuVsl-css', styleConfigs.text, true);
        await applyStyles('.comment-box', styleConfigs.text);
    }

    async function styleMain() {
        while (!document.querySelector(".title")) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        setStyle();
    }

    styleMain();
}

chStyle();