-- RedefineIndex
CREATE UNIQUE INDEX `_articletotag_AB_unique` ON `_articletotag`(`A`, `B`);
DROP INDEX `_ArticleToTag_AB_unique` ON `_articletotag`;

-- RedefineIndex
CREATE INDEX `_articletotag_B_index` ON `_articletotag`(`B`);
DROP INDEX `_ArticleToTag_B_index` ON `_articletotag`;
