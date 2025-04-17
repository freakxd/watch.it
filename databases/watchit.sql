--watch.it adatbázis sémája
CREATE DATABASE watchit DEFAULT CHARACTER SET UTF8 COLLATE utf8_hungarian_ci;

USE watchit;

CREATE TABLE `account` (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(30) NOT NULL,
  password varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  role int(2) NOT NULL DEFAULT 0,
  created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  verification_code int(6) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE comments (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  movie_id INT(11) NOT NULL,
  series_id INT(11) NOT NULL,
  comment TEXT NOT NULL,
  rating INT(1) NOT NULL DEFAULT(0),
  recommended BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY comments(user_id) REFERENCES account(id)
);

CREATE TABLE commentlikes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  comment_id INT NOT NULL,
  likes INT(1) NOT NULL DEFAULT 0,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE(user_id, comment_id)
);
--phpmail jelszo: ynzd bgae pokl ukuw