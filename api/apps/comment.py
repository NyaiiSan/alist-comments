import sqlite3
import base64

from typing import List, Union

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel, Field

class Comment(BaseModel):
    ''' 评论内容结构 '''
    content: str = Field(min_length=1, max_length=400, description="消息内容")
    name: str = None
    time: str = None

class CommentResponse(BaseModel):
    ''' 响应返回 '''
    code: int = 0
    msg: str = "success"
    data: Union[List[Comment], str, None] = None

SQLITE_PATH = "database.db"

comment_router = APIRouter()

@comment_router.get("/", response_model=CommentResponse)
async def get_comments(request: Request, response: Response, skip: int, length: int):
    if skip == 0:
        response.set_cookie(key="comment_token", value=generate_user_token(request), httponly=True, max_age=1200)
    try:
        with sqlite3.connect(SQLITE_PATH) as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM comments")
            total_count = c.fetchone()[0]
            start_position = total_count - skip - length
            if start_position < 0:
                length += start_position
                if length < 0:
                    length = 0
                start_position = 0

            comments = []
            for m in c.execute("SELECT content, name, Time FROM comments LIMIT ? OFFSET ? ;",
                            (length, start_position)):
                comments.append(Comment(content=m[0], name=m[1], time=m[2]))
    except sqlite3.OperationalError as e:
        return CommentResponse(code=1, msg=f"Database error: {e}", data=None)

    return CommentResponse(name=generate_user_token(request), data=comments)

@comment_router.post("/", response_model=CommentResponse, response_model_exclude_unset=True)
async def get_comments(request: Request, comment: Comment):
    # 验证用户身份
    token = request.cookies.get("comment_token")
    if not check_user_token(token, request):
        return CommentResponse(code=1, msg="User token is missing", data=None)

    user_ip = get_ip(request)
    comment.name = hide_ip(user_ip)

    try:
        init_database()
        with sqlite3.connect(SQLITE_PATH) as conn:
            c = conn.cursor()
            c.execute("SELECT max(ID) FROM comments;")
            last_mes_id = c.fetchone()
            mes_id = last_mes_id[0] + 1 if last_mes_id[0] != None else 0
            c.execute("INSERT INTO comments(ID, name, content, IP, time) VALUES (?, ?, ?, ?, datetime('now','localtime'));",
                        (mes_id, comment.name, comment.content, user_ip))
    except sqlite3.OperationalError as e:
        return CommentResponse(code=1, msg=f"Database error: {e}", data=None)

    return CommentResponse(code=0, msg="success", data=None)

def init_database():
    sqlite_cmd = '''
    CREATE TABLE IF NOT EXISTS comments(
        ID          INT PRIMARY KEY NOT NULL,
        NAME        TEXT NOT NULL,
        content     TEXT NOT NULL,
        IP          TEXT NOT NULL,
        Time        TEXT NOT NULL );
        '''
    with sqlite3.connect(SQLITE_PATH) as conn:
        c = conn.cursor()
        try:
            c.execute(sqlite_cmd)
            for s in c.execute('SELECT count(*) FROM comments;'):
                print('find data count: %s.'%s[0])
        except Exception as e:
            print(e)

def get_ip(request: Request) -> str:
    if user_ip := request.headers.get('X-Forwarded-For', None):
        return user_ip

    if user_ip := request.headers.get('X-Real-IP', None):
        return user_ip

    return request.client.host

def hide_ip(ip:str) -> str:
    '''将ip地址部分隐藏'''
    res = ip.split(':') if ':' in ip else ip.split('.')
    res[1] = " * "
    res[2] = " * "
    res = ":".join(res) if ':' in ip else ".".join(res)
    return res

def check_user_token(token, request: Request) -> bool:
    ip = get_ip(request)
    if token and base64.b64encode(ip.encode()).decode() == token:
        return True
    return False

def generate_user_token(request: Request) -> str:
    ip = get_ip(request)
    return base64.b64encode(ip.encode()).decode()

init_database()
