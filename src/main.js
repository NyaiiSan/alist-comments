import { createApp } from 'vue'
import App from './App.vue'

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
        commentBox.classList.add("comBox");
        bodyElement.appendChild(commentBox);
        createApp(App).mount('#comment');
    }
}

commentsMain();

