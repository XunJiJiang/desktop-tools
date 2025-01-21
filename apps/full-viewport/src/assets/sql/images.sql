-- 图片资源表
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL, -- 图片文件路径
  upload_datetime INTEGER NOT NULL, -- 上传日期 从 1970-01-01 00:00:00 UTC 算起的秒数
  description TEXT, -- 图片描述
);