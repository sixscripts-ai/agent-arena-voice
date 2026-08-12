CREATE TABLE IF NOT EXISTS `voice_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `originalName` VARCHAR(180) NOT NULL,
  `storageKey` VARCHAR(512) NOT NULL,
  `storageUrl` VARCHAR(768) NOT NULL,
  `mimeType` VARCHAR(128) NOT NULL,
  `sizeBytes` INT NOT NULL,
  `category` ENUM('reference', 'voice-note', 'transcript') NOT NULL DEFAULT 'reference',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `voice_files_storage_key_unique` (`storageKey`),
  KEY `voice_files_user_created_idx` (`userId`, `createdAt`)
);
