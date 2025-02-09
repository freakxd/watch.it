CREATE DATABASE watchit DEFAULT CHARACTER SET UTF8 COLLATE utf8_hungarian_ci;

CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` int(2) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `verification_code` int(6) NOT NULL,
  PRIMARY KEY (`id`)
)

--phpmail jelszo: ynzd bgae pokl ukuw