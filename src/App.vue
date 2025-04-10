<template>
    <h3 class="comment-title">Comment</h3>
    <div>
        <div class="comment-input-box">
            <textarea class="comment-input-text" rows="4" v-model="comInput"></textarea>
            <div class="comment-input-buttom-box">
                <button class="comment-button" @click="uploadComments">发送</button>
            </div>
        </div>
        <div>
            <div class="comment-item" v-for="comment in comments">
                <div>
                    <p class="comment-message-user">{{ comment.name }}</p>
                    <p class="comment-message-time">{{ comment.time }}</p>
                </div>
                <div>
                    <p class="comment-message-text">{{ comment.content }}</p>
                </div>
            </div>
        </div>
        <button class="comment-button" @click="loadMore" v-show="loadable">显示更多</button>
    </div>
</template>

<script>
export default {
    setup() {
        var skip = 0; // 跳过的评论数
        var length = 5; // 每次请求的评论数
        const request_url = '/comments'; // 发送评论的接口;

        return {
            skip,
            length,
            request_url,
        };
    },
    data() {
        return {
            comments: [],
            loadable: true,
            comInput: null,
        };
    },
    methods: {
        async fetchComments() {
            try {
                const response = await fetch(`${this.request_url}?skip=${this.skip}&length=${this.length}`);
                if (!response.ok) {
                    throw new Error(`HTTP error code: ${response.status}`);
                }
                const responseData = await response.json();
                if (responseData.status !== 0) {
                    throw new Error(responseData.data);
                }
                const recv_comments = responseData.data;
                recv_comments.reverse();
                this.comments = [ ...this.comments, ...recv_comments]; // 将新评论添加到现有评论的前面
                if (responseData.data.length < this.length) {
                    this.loadable = false; // 如果返回的评论数小于请求的评论数，则不再显示“加载更多”按钮
                }
                this.skip += responseData.data.length; // 更新跳过的评论数
            } catch (error) {
                console.error('Get Comments error:', error);
            }
        },
        async uploadComments() {
            // 判断输入是否为空
            if (this.comInput == null || this.comInput == '') {
                alert("输入的内容不可为空");
                return ;
            }

            try {
                const response = await fetch(this.request_url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({content: this.comInput}),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error code: ${response.status}`);
                }

                const responseData = await response.json();
                console.log('response:', responseData);

                if (responseData.status !== 0) {
                    alert(responseData.data);
                    throw new Error(responseData.data);
                }
                alert("success");
                this.resetComments();

            } catch (error) {
                console.error('Push Comments error:', error);
            }

        },
        async loadMore() {
            await this.fetchComments();
        },
        resetComments (){
            this.comments = [];
            this.loadable = true;
            this.comInput = null;
            this.skip = 0;
            this.fetchComments();
        },
    },
    mounted() {
        this.fetchComments(); // 组件挂载时请求数据
    },
};
</script>

<style>
.comment-box {
    width: var(--hope-sizes-full);
    border-radius: var(--hope-radii-xl);
    padding: var(--hope-space-4);
    background-color: white;
    box-shadow: var(--hope-shadows-lg);
}

.comment-title {
    margin-bottom: 30px;
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.25;
}

.comment-input-box {
    flex: 1 1 0%;
    padding-inline-start: var(--hope-space-5);
    padding-inline-end: var(--hope-space-5);
    padding-top: var(--hope-space-2);
    padding-bottom: var(--hope-space-2);
}

.comment-input-text {
    resize: none; /* 禁止调整大小 */
    appearance: none;
    position: relative;
    width: 100%;
    min-width: 0px;
    outline: none;
    border: 1px solid transparent;
    border-radius: var(--hope-radii-lg);
    background-color: var(--hope-colors-neutral3);
    padding-top: var(--hope-space-3);
    padding-bottom: var(--hope-space-3);
    padding-inline-start: var(--hope-space-3);
    padding-inline-end: var(--hope-space-3);
    color: var(--hope-colors-neutral12);
    font-size: var(--hope-fontSizes-base);
    line-height: var(--hope-lineHeights-base);
    transition: color 250ms, border-color 250ms, background-color 250ms, box-shadow 250ms;
}

.comment-input-text:focus {
    box-shadow: unset;
    border-color: var(--hope-colors-info8);
}

.comment-input-buttom-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: var(--hope-space-3);
    padding-inline-start: var(--hope-space-5);
    padding-inline-end: var(--hope-space-5);
    padding-bottom: var(--hope-space-5);
}

.comment-button {
    height: var(--hope-sizes-10);
    padding-top: 0px;
    padding-bottom: 0px;
    padding-inline-start: var(--hope-space-4);
    padding-inline-end: var(--hope-space-4);
    font-size: var(--hope-fontSizes-base);
    border-radius: var(--hope-radii-lg);
    background-color: var(--hope-colors-info4);
    color: var(--hope-colors-info11);
    border: 1px solid transparent;
}

.comment-button:focus {
    outline: none;
}

.comment-button:hover {
    transform: scale(1.01);
    background-color: rgba(132, 133, 141, 0.18);
}

.comment-item {
    flex-direction: column;
    align-items: left;
    width: var(--hope-sizes-full);
    padding: var(--hope-space-2);
    border-radius: var(--hope-radii-lg);
    transition: 0.3s;
    transition-behavior: normal;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    transition-delay: 0s;
    transition-property: all;
}

.comment-item:hover {
    transform: scale(1.01);
    background-color: rgba(132, 133, 141, 0.18);
}

.comment-message-text {
    margin: 0px;
}

.comment-message-user {
    font-size: 1.25em;
    color: #000;

    margin: 5px 0px 5px;

    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
}

.comment-message-time {
    font-size: 14px;
    color: #707070;
    margin: 10px 0px 10px;
    padding: 0px 5px 0px;

    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
}
</style>
