-- 交易表
CREATE TABLE IF NOT EXISTS account_book_transaction (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  account_id INTEGER NOT NULL, -- 账户ID
  content TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL, -- 收入/支出
  remarks TEXT,
  currency TEXT NOT NULL, -- 货币类型
  category TEXT, -- 交易类别
  repeat TEXT, -- 重复交易设置
  attachment TEXT, -- 附件路径
  counterparty TEXT, -- 交易对方
  budget TEXT, -- 预算
  reminder TEXT, -- 提醒
  geolocation TEXT, -- 地理位置
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 账户名称，如银行卡、微信、支付宝等
  type TEXT NOT NULL, -- 账户类型
  icon TEXT NOT NULL -- 账户图标
);

-- 标签表
CREATE TABLE IF NOT EXISTS account_book_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 标签名称
  color TEXT NOT NULL -- 标签颜色
);

-- 交易标签表（多对多关系）
CREATE TABLE IF NOT EXISTS account_book_transaction_tags (
  transaction_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES account_book_transaction(id),
  FOREIGN KEY (tag_id) REFERENCES account_book_tags(id),
  PRIMARY KEY (transaction_id, tag_id)
);