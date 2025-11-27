create database tododb;
use tododb;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todos (
    todo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO users (email, user_name, password) VALUES ('admin@example.com', 'Admin User', 'adminpass');

INSERT INTO users (email, user_name, password) VALUES ('user1@example.com', 'Test User One', 'password');
INSERT INTO users (email, user_name, password) VALUES ('user2@example.com', 'Test User Two', 'password');

INSERT INTO todos (user_id, title) VALUES (2, 'Buy groceries');
INSERT INTO todos (user_id, title, is_completed) VALUES (2, 'Finish project report', TRUE);
INSERT INTO todos (user_id, title) VALUES (2, 'Call the bank');

INSERT INTO todos (user_id, title) VALUES (3, 'Schedule dentist appointment');
INSERT INTO todos (user_id, title) VALUES (3, 'Pay electricity bill');

CREATE TABLE board (
    board_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,-- 게시물　제목
    content TEXT NOT NULL,-- 게시물　내용
    views INT DEFAULT 0,-- 조회수
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 테스트용 게시글 데이터 삽입
INSERT INTO board (user_id, title, content) VALUES (1, '첫 번째 공지사항', '공지사항 내용입니다.\n환영합니다.');
INSERT INTO board (user_id, title, content) VALUES (1, '자유게시판 이용 수칙', '욕설 비방 금지입니다.');
INSERT INTO board (user_id, title, content) VALUES (2, '안녕하세요 가입인사', '반갑습니다. 잘 부탁드려요.');
