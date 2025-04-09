/** 
 * always create primary key / index files on top and foreign key files at botton
 * 
 * the files will be create in the name of object key 
 * howerver if you want/have a table with diffrent name you can assign value to it.
 * 
 * like in the expample below, the file will be creatd in the name of user 
 * but it will refference table as users i.e. create table users(id int)
*/
module.exports = schema = {
  users: 'users',
  entity: 'entity',
  party: 'party',
  supplier: 'supplier',
  address: 'address',
  partners: 'partners',
  orders: 'orders',
  purchase: 'purchase',
  purchase_items: 'purchase_items',
  stock: 'stock',
  dstk: 'defective_stock',
  sold: 'sold',
  stockreturn: 'stockreturn',
  offers: 'offers',
  express: 'express',
  bank: 'bank',
  passbook: 'passbook',
  pymtmethods: 'pymt_methods',
  payments: 'payments',
  employee: 'employee',
  emp_advance: 'emp_advance',
  salary: 'salary',
  contact: 'contact',
  discounts: 'discounts',
  coupons: 'coupons',
  empsales: 'empsales',
  expense: 'expense',
  holds: 'holds',
  hold: 'hold',
  holditems: 'holditems',
  rewards: 'rewards',
  settings: 'settings',
  activation: 'activation',
  restrictions: 'restrictions',
  daybook: 'daybook',
  gst: 'gst_rates',
  folders: 'folders',
  notes: 'notes',
  groups: 'groups',
  members: 'members',
}

