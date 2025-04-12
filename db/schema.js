const queries = [
    {
        id: 1,
        name: 'users',
        sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, contact TEXT, email TEXT UNIQUE, user_role TEXT DEFAULT 'user', is_active TEXT DEFAULT 'yes', google_id TEXT UNIQUE, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));",
    },
    {
        id: 2,
        name: "entity",
        sql: "CREATE TABLE IF NOT EXISTS entity (id INTEGER PRIMARY KEY AUTOINCREMENT, entity_id TEXT NOT NULL UNIQUE, entity_name TEXT UNIQUE, entity_type TEXT, tag_line TEXT, reg_num TEXT, pan_num TEXT, gst_num TEXT, reg_since TEXT, contact TEXT, email TEXT, website TEXT, address TEXT, city TEXT, pincode TEXT, state TEXT, state_code TEXT, logo TEXT, status INTEGER DEFAULT 0, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));",
    },
    {
        id: 3,
        name: "party",
        sql: "CREATE TABLE IF NOT EXISTS party (id INTEGER PRIMARY KEY AUTOINCREMENT, party_id TEXT, reg_date TEXT, party_type TEXT DEFAULT 'Customer', title TEXT, party_name TEXT NOT NULL, contact TEXT, email TEXT, company TEXT, gender TEXT, pan_num TEXT, gst_number TEXT, birthday TEXT, aadhaar TEXT, address TEXT, city TEXT, pincode TEXT, state TEXT, state_code TEXT, country TEXT DEFAULT 'India', rewards REAL, reward_percent TEXT DEFAULT '1', enable_rewards INTEGER DEFAULT 1, opening_bal REAL DEFAULT 0, opening_cr REAL DEFAULT 0, comments TEXT, profile_image TEXT, user_id INTEGER, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);",
    },
    {
        id: 4,
        name: "supplier",
        sql: "CREATE TABLE IF NOT EXISTS supplier ( id INTEGER PRIMARY KEY AUTOINCREMENT, sup_id TEXT, reg_date DATE DEFAULT (date('now')), title TEXT, supplier_name TEXT NOT NULL, contact TEXT, email TEXT, gender TEXT, gst_number TEXT, address TEXT, city TEXT, pincode TEXT, state TEXT, state_code TEXT, country TEXT DEFAULT 'India', opening_bal DECIMAL(9,2) DEFAULT 0.00, comments TEXT, profile_image TEXT, user_id INTEGER, entity INTEGER DEFAULT 1, timestamp DATETIME DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL );",
    },
    {
        id: 5,
        name: "partners",
        sql: "CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, partner_id INTEGER NOT NULL, entity INTEGER NOT NULL, partnership INTEGER NULL, FOREIGN KEY (partner_id) REFERENCES party(id) ON DELETE CASCADE ON UPDATE CASCADE);",
    },
    {
        id: 5,
        name: "address",
        sql: "CREATE TABLE IF NOT EXISTS address (id INTEGER PRIMARY KEY AUTOINCREMENT, party INTEGER NOT NULL, type TEXT, address TEXT, htmladdress TEXT, city TEXT, pincode TEXT, state TEXT, state_code TEXT, country TEXT DEFAULT 'India', lmark TEXT, notes TEXT, entity INTEGER DEFAULT 1, FOREIGN KEY (party) REFERENCES party(id) ON DELETE CASCADE);",
    },
    {
        id: 7,
        name: "orders",
        sql: "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL UNIQUE, order_date TEXT NOT NULL, order_type TEXT NULL, bill_type TEXT NULL, inv_number TEXT NULL, party INTEGER NULL, subtotal REAL NULL, discount REAL NULL, totaltax REAL NULL, manual_tax REAL NULL, freight REAL NULL, round_off REAL NULL, alltotal REAL NULL, previous_due REAL NULL, gst_type TEXT NULL, tax_type TEXT NULL, fin_year TEXT NULL, status TEXT NULL, adjustment REAL NULL, ship_id INTEGER NULL, rewards INTEGER NULL, redeem INTEGER NULL, notes TEXT NULL, category TEXT NULL, location TEXT NULL, user_id INTEGER NULL, disc_id INTEGER NULL, disc_percent REAL NULL, entity INTEGER NOT NULL DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (ship_id) REFERENCES address(id) ON DELETE SET NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL, FOREIGN KEY (party) REFERENCES party(id) ON DELETE SET NULL);"
    },
    {
        id: 8,
        name: "purchase",
        sql: "CREATE TABLE IF NOT EXISTS purchase (id INTEGER PRIMARY KEY AUTOINCREMENT, supid INTEGER NULL, order_date TEXT DEFAULT (date('now')), order_number TEXT NULL, bill_date TEXT NULL, bill_type TEXT NULL, bill_number TEXT NULL, sub_total REAL NULL, discount REAL NULL, tax_amount REAL NULL, gst_roundoff REAL NULL, freight REAL NULL, bill_amount REAL NULL, quantity REAL NULL, ref_filename TEXT NULL, fin_year TEXT NULL, notes TEXT NULL, user_id INTEGER NULL, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));"
    },
    {
        id: 9,
        name: "stock",
        sql: "CREATE TABLE IF NOT EXISTS stock (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT NOT NULL UNIQUE, ean TEXT, hsn TEXT, upc TEXT, pcode TEXT, product TEXT NOT NULL, mrp REAL, price REAL, wsp REAL, sale_price REAL, gst REAL, purch_price REAL, cost REAL, cost_gst REAL, unit TEXT, size TEXT, qty REAL, type TEXT, discount REAL, disc_type TEXT, colour TEXT, season TEXT, section TEXT, category TEXT, label TEXT, tag TEXT, brand TEXT, vendor TEXT, comments TEXT, purch_id INTEGER, purch_date TEXT, image TEXT, updated_qty REAL, user_id INTEGER, temp_id TEXT, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (purch_id) REFERENCES purchase(id) ON DELETE SET NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);"
    },
    {
        id: 10,
        name: "defective_stock",
        sql: "CREATE TABLE IF NOT EXISTS defective_stock (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT NOT NULL, qty REAL DEFAULT 1, description TEXT, dnote_id INTEGER, FOREIGN KEY (dnote_id) REFERENCES purchase(id) ON DELETE SET NULL);"
    },
    {
        id: 11,
        name: "sold",
        sql: "CREATE TABLE IF NOT EXISTS sold (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, sku TEXT, hsn TEXT, category TEXT, qty REAL, product TEXT, pcode TEXT, size TEXT, unit TEXT, mrp REAL, price REAL, disc REAL, gst REAL, tax REAL, net REAL, gross REAL, disc_val REAL, disc_per REAL, emp_id INTEGER, entity INTEGER DEFAULT 1, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE);"
    },
    {
        id: 12,
        name: "stockreturn",
        sql: "CREATE TABLE IF NOT EXISTS stockreturn (id INTEGER PRIMARY KEY AUTOINCREMENT, purch_id INTEGER NOT NULL, sku TEXT, product TEXT, qty REAL, cost REAL, cost_gst REAL, size TEXT, unit TEXT, hsn TEXT, entity INTEGER DEFAULT 1, FOREIGN KEY (purch_id) REFERENCES purchase(id) ON DELETE CASCADE);"
    },
    {
        id: 13,
        name: "offers",
        sql: "CREATE TABLE IF NOT EXISTS offers (id INTEGER PRIMARY KEY AUTOINCREMENT, offer TEXT NOT NULL, sku TEXT, price REAL, min_qty REAL, validity TEXT, condition TEXT, description TEXT, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));"
    },
    {
        id: 14,
        name: "bank",
        sql: "CREATE TABLE IF NOT EXISTS bank (id INTEGER PRIMARY KEY AUTOINCREMENT, bank_name TEXT NOT NULL, account_type TEXT, account_holder TEXT, account_number TEXT, ifscode TEXT, entity INTEGER NOT NULL DEFAULT 1);"
    },
    {
        id: 15,
        name: "passbook",
        sql: "CREATE TABLE IF NOT EXISTS passbook ( id INTEGER PRIMARY KEY AUTOINCREMENT, bank_id INTEGER NOT NULL, txn_date TEXT, description TEXT, reference TEXT, credit REAL, debit REAL, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (bank_id) REFERENCES bank(id) ON DELETE CASCADE );"
    },
    {
        id: 16,
        name: "pymt_methods",
        sql: "CREATE TABLE IF NOT EXISTS pymt_methods (id INTEGER PRIMARY KEY AUTOINCREMENT, method TEXT, default_bank INTEGER, FOREIGN KEY (default_bank) REFERENCES bank(id) ON DELETE SET NULL);"
    },
    {
        id: 17,
        name: "payments",
        sql: "CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, party INTEGER NULL, pymt_date TEXT NULL, pymt_for TEXT DEFAULT 'Sales', order_id INTEGER NULL, purch_id INTEGER NULL, amount REAL NOT NULL, cash REAL NULL, bank REAL NULL, other REAL NULL, bank_mode TEXT NULL, pymt_method INTEGER NULL, bank_id INTEGER NULL, txnid TEXT NULL, adjustment REAL NULL, forfiet REAL NULL, notes TEXT NULL, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY (purch_id) REFERENCES purchase(id) ON DELETE CASCADE, FOREIGN KEY (bank_id) REFERENCES bank(id) ON DELETE SET NULL, FOREIGN KEY (pymt_method) REFERENCES pymt_methods(id) ON DELETE SET NULL);"
    },
    {
        id: 18,
        name: "employee",
        sql: "CREATE TABLE IF NOT EXISTS employee (id INTEGER PRIMARY KEY AUTOINCREMENT, party INTEGER NULL, emp_id TEXT NULL, emp_name TEXT NOT NULL, birthday TEXT NULL, joining TEXT NULL, bg TEXT NULL, deg TEXT NULL, father TEXT NULL, mother TEXT NULL, address TEXT NULL, aadhaar TEXT NULL, hometown TEXT NULL, ecd TEXT NULL, ref TEXT NULL, email TEXT NULL, gender TEXT NULL, salary REAL NULL, contact TEXT NULL, exprience TEXT NULL, education TEXT NULL, department TEXT NULL, lwd TEXT NULL, image TEXT NULL, status TEXT DEFAULT 'Active');"
    },
    {
        id: 19,
        name: "emp_advance",
        sql: "CREATE TABLE IF NOT EXISTS emp_advance (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id INTEGER, pymt_date TEXT NOT NULL, amount REAL NOT NULL, pymt_mode TEXT, purpose TEXT, FOREIGN KEY (emp_id) REFERENCES employee(id) ON DELETE CASCADE);"
    },
    {
        id: 20,
        name: "salary",
        sql: "CREATE TABLE IF NOT EXISTS salary (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id INTEGER NULL, date TEXT NOT NULL, amount REAL DEFAULT 0.00, entry_for TEXT DEFAULT 'salary', pymt_mode TEXT NULL, bank_mode TEXT NULL, bank_id INTEGER NULL, description TEXT NULL, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), entity INTEGER DEFAULT 1, FOREIGN KEY (emp_id) REFERENCES employee (id) ON DELETE SET NULL, FOREIGN KEY (bank_id) REFERENCES bank (id) ON DELETE SET NULL);"
    },
    {
        id: 21,
        name: "contact",
        sql: "CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY AUTOINCREMENT, party INTEGER NULL, party_id TEXT NOT NULL, type TEXT NULL, contact TEXT NULL, email TEXT NULL, website TEXT NULL, notes TEXT NULL, entity INTEGER DEFAULT 1, FOREIGN KEY (party) REFERENCES party (id) ON DELETE CASCADE);"
    },
    {
        id: 22,
        name: "discounts",
        sql: "CREATE TABLE IF NOT EXISTS discounts (id INTEGER PRIMARY KEY AUTOINCREMENT, disc_name TEXT NOT NULL, disc_type TEXT DEFAULT '%', value REAL NULL);"
    },
    {
        id: 23,
        name: "coupons",
        sql: "CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT, value REAL, validity INTEGER);"
    },
    {
        id: 24,
        name: "empsales",
        sql: "CREATE TABLE IF NOT EXISTS empsales (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id INTEGER NOT NULL, order_id INTEGER, sales REAL NOT NULL DEFAULT 0, FOREIGN KEY (emp_id) REFERENCES party(id) ON DELETE CASCADE, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE);"
    },
    {
        id: 25,
        name: "expense",
        sql: "CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, amount REAL NOT NULL, pymt_mode TEXT, bank_mode TEXT, pymt_method INTEGER, exp_type TEXT, description TEXT, bank_id INTEGER, user_id INTEGER DEFAULT 1, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (bank_id) REFERENCES bank(id) ON DELETE SET NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL, FOREIGN KEY (pymt_method) REFERENCES pymt_methods(id) ON DELETE SET NULL);"
    },
    {
        id: 26,
        name: "hold",
        sql: "CREATE TABLE IF NOT EXISTS hold (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NULL, date TEXT NOT NULL, bill_type TEXT NOT NULL, party INTEGER NOT NULL, mtax REAL NULL, disc REAL NULL, disc_type TEXT NULL, disc_percent REAL NULL, disc_notes TEXT NULL, freight REAL NULL, pymt_amount REAL NULL, cash REAL NULL, bank REAL NULL, other REAL NULL, bank_mode TEXT NULL, pymt_method TEXT NULL, bank_id INTEGER NULL, txnid TEXT NULL, pymt_notes TEXT NULL, entity INTEGER NOT NULL DEFAULT 1, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL);"
    },
    {
        id: 27,
        name: "holditems",
        sql: "CREATE TABLE IF NOT EXISTS holditems (id INTEGER PRIMARY KEY AUTOINCREMENT, hold_id INTEGER NOT NULL, sku TEXT NULL, hsn TEXT NULL, qty REAL NULL, product TEXT NULL, pcode TEXT NULL, size TEXT NULL, mrp REAL NULL, price REAL NULL, disc REAL NULL, disc_val REAL NULL, disc_per REAL NULL, gst REAL NULL, emp_id INTEGER NULL, FOREIGN KEY (hold_id) REFERENCES hold(id) ON DELETE CASCADE);"
    },
    {
        id: 28,
        name: "rewards",
        sql: "CREATE TABLE IF NOT EXISTS rewards (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, party INTEGER NOT NULL, rewards REAL DEFAULT 0, redeemed REAL DEFAULT 0, entity INTEGER DEFAULT 1, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE);"
    },
    {
        id: 29,
        name: "settings",
        sql: "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, entity INTEGER DEFAULT 1, rewards INTEGER DEFAULT 0, strict_mode INTEGER DEFAULT 0, default_bank INTEGER NULL, service_email TEXT NULL, email_client TEXT NULL, email_pwd TEXT NULL);"
    },
    {
        id: 30,
        name: "activation",
        sql: "CREATE TABLE IF NOT EXISTS activation (id INTEGER PRIMARY KEY AUTOINCREMENT, activation_key TEXT, version TEXT, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));"
    },
    {
        id: 31,
        name: "restrictions",
        sql: "CREATE TABLE IF NOT EXISTS restrictions (id INTEGER PRIMARY KEY AUTOINCREMENT, userid INTEGER NOT NULL, change_order_date INTEGER DEFAULT 0, change_product_mode INTEGER DEFAULT 1, manual_bill INTEGER DEFAULT 1, edit_order INTEGER DEFAULT 0, edit_payment INTEGER DEFAULT 0, edit_entity INTEGER DEFAULT 0, edit_party INTEGER DEFAULT 1, edit_bank INTEGER DEFAULT 0, edit_expense INTEGER DEFAULT 0, edit_stock INTEGER DEFAULT 0, edit_purchase INTEGER DEFAULT 0, edit_settigns INTEGER DEFAULT 0, delete_order INTEGER DEFAULT 0, delete_payment INTEGER DEFAULT 0, delete_stock INTEGER DEFAULT 0, delete_purchase INTEGER DEFAULT 0, delete_bank INTEGER DEFAULT 0, delete_expense INTEGER DEFAULT 0, delete_entity INTEGER DEFAULT 0, view_sales INTEGER DEFAULT 0, view_employees INTEGER DEFAULT 0, view_partydues INTEGER DEFAULT 0, view_expenses INTEGER DEFAULT 1, view_orders INTEGER DEFAULT 1, view_closing INTEGER DEFAULT 1, view_purchase INTEGER DEFAULT 1, create_bank INTEGER DEFAULT 0, create_stock INTEGER DEFAULT 0, create_entity INTEGER DEFAULT 0, create_refund INTEGER DEFAULT 0, create_purchase INTEGER DEFAULT 0, create_user INTEGER DEFAULT 0, FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE);"
    },
    {
        id: 32,
        name: "daybook",
        sql: "CREATE TABLE IF NOT EXISTS daybook (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, credit REAL, debit REAL, description TEXT, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')));"
    },
    {
        id: 33,
        name: "gst_rates",
        sql: "CREATE TABLE IF NOT EXISTS gst_rates (id INTEGER PRIMARY KEY AUTOINCREMENT, rate REAL NOT NULL, display_as TEXT NULL, entity INTEGER DEFAULT 1);"
    },
    {
        id: 34,
        name: "folders",
        sql: "CREATE TABLE IF NOT EXISTS folders (id INTEGER PRIMARY KEY AUTOINCREMENT, folder TEXT NOT NULL UNIQUE);"
    },
    {
        id: 35,
        name: "notes",
        sql: "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, details TEXT, status TEXT, folder_id INTEGER, entity INTEGER DEFAULT 1, timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL);"
    },
    {
        id: 36,
        name: "groups",
        sql: "CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT, entity INTEGER DEFAULT 1);"
    },
    {
        id: 37,
        name: "members",
        sql: "CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, party INTEGER, group_id INTEGER, FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL, UNIQUE (party, group_id));"
    }
];

module.exports = queries;