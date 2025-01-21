-- 交易组表
CREATE TABLE IF NOT EXISTS account_book_transaction_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datetime INTEGER NOT NULL, -- 从 1970-01-01 00:00:00 UTC 算起的秒数
  location TEXT, -- 地点
  status INTEGER NOT NULL, -- 状态 0: 支出 1: 收入 2: 无变动 (用于认定当前余额)
  remarks TEXT, -- 备注
  counterparty TEXT, -- 交易对方
  category TEXT, -- 交易类别
  currency TEXT NOT NULL, -- 货币类型
  total_amount TEXT NOT NULL, -- 总价
  account_id INTEGER NOT NULL, -- 账户ID
  FOREIGN KEY (account_id) REFERENCES accounts_book_accounts(id) ON DELETE RESTRICT
);

-- 交易项表
CREATE TABLE IF NOT EXISTS account_book_transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL, -- 交易组ID
  content TEXT NOT NULL, -- 内容
  unit_price TEXT, -- 单价(非必须)
  attachment TEXT, -- 附件路径, 多个附件用逗号分隔
  quantity TEXT NOT NULL, -- 数量
  remarks TEXT, -- 备注
  FOREIGN KEY (group_id) REFERENCES account_book_transaction_groups(id) ON DELETE RESTRICT
);

-- 账户表
CREATE TABLE IF NOT EXISTS accounts_book_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 账户名称，如某银行卡、微信、支付宝等
  type TEXT NOT NULL, -- 账户类型
  icon TEXT -- 账户图标
);

-- 交易组标签表
CREATE TABLE IF NOT EXISTS account_book_group_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 标签名称
  color TEXT NOT NULL -- 标签颜色
);

-- 交易项标签表
CREATE TABLE IF NOT EXISTS account_book_item_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 标签名称
  color TEXT NOT NULL -- 标签颜色
);

-- 交易组标签关系表(多对多)
CREATE TABLE IF NOT EXISTS account_book_transaction_group_tags (
  transaction_id INTEGER NOT NULL, -- 交易组ID
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES account_book_transaction_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES account_book_group_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- 交易项标签关系表(多对多)
CREATE TABLE IF NOT EXISTS account_book_transaction_item_tags (
  transaction_id INTEGER NOT NULL, -- 交易项ID
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES account_book_transaction_items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES account_book_item_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);