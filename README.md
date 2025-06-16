### 为Alist添加一个简单的留言评论功能

#### 环境

1. Python and FastApi: 后端接口

2. Nginx: url 路由

3. Alist

#### 配置

1. run build

2. python 运行 api

3. 配置 Nginx 路径转发 /resource 和 /comments

4. 修改 Alist 全局配置，自定义头部

   ```html
   <script type="module" crossorigin src="/resource/index-xxxxxxxx.js"></script>
   <link rel="stylesheet" crossorigin href="/resource/index-xxxxxxxx.css">
   ```

