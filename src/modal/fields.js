const s = require('./schema') // schema

// update
const update = {
  [s.users]: [`name`, `user_id`, `username`, `contact`, `email`, `id`],
  [s.entity]: [`entity_name`, `entity_type`, `tag_line`, `reg_num`, `pan_num`, `gst_num`, `reg_since`, `contact`, `email`, `website`, `address`, `city`, `state`, `state_code`, `pincode`, `id`],
  [s.party]: [`reg_date`, `party_type`, `title`, `party_name`, `contact`, `email`, `company`, `gender`, `aadhaar`, `pan_num`, `gst_number`, `birthday`, `address`, `city`, `state`, `state_code`, `rewards`, `reward_percent`, `enable_rewards`, `pincode`, `opening_bal`, `opening_cr`, `id`],
  [s.supplier]: [`reg_date`, `title`, `supplier_name`, `contact`, `email`, `gst_number`, `address`, `city`, `pincode`, `state`, `state_code`, `country`, `opening_bal`, `comments`, `id`],
  [s.address]: [`type`, `address`, `htmladdress`, `city`, `pincode`, `state`, `state_code`, `country`, `lmark`, `notes`, `id`],
  [s.stock]: ['ean', `hsn`, `upc`, `pcode`, `product`, `mrp`, `price`, `wsp`, `gst`, `purch_price`, `cost`, `cost_gst`, `unit`, `size`, `qty`, `type`, `discount`, `disc_type`, `colour`, `season`, `section`, `category`, `label`, `tag`, `brand`, `comments`, `id`],
  [s.contact]: [`type`, `contact`, `email`, `website`, `notes`, `id`],
  [s.gst]: [`business_name`, `gst_number`, `address`, `state`, `pincode`, `id`],
  [s.orders]: [`party`, `inv_number`, `order_date`, `order_type`, `subtotal`, `discount`, `totaltax`, `manual_tax`, `freight`, `round_off`, `alltotal`, `previous_due`, `gst_type`, `tax_type`, `fin_year`, `status`, `adjustment`, `ship_id`, `rewards`, `redeem`, `notes`, `category`, `location`, `user_id`, `disc_id`, `disc_percent`, `id`],
  [s.payments]: [`party`, `pymt_date`, `pymt_for`, `order_id`, `purch_id`, `amount`, `cash`, `bank`, `other`, `bank_mode`, `pymt_method`, `bank_id`, `txnid`, `adjustment`, `notes`, `id`],
  [s.rewards]: [`order_id`, `party`, `rewards`, `redeemed`, `id`],
  [s.express]: [`counterid`, `id`],
  [s.employee]: [`emp_id`, `emp_name`, `birthday`, `joining`, `bg`, `deg`, `father`, `mother`, `aadhaar`, `address`, `hometown`, `ecd`, `ref`, `gender`, `salary`, `contact`, `exprience`, `education`, `department`, `lwd`, `status`, `id`],
  [s.settings]: [`rewards`, `service_email`, `email_client`, `email_pwd`, `default_bank`, `id`],
  [s.activation]: [`activation_key`],
  [s.purchase]: [`supid`, `order_date`, `bill_date`, `bill_type`, `bill_number`, `sub_total`, `bill_amount`, `discount`, `tax_amount`, `freight`, `gst_roundoff`, `quantity`, `fin_year`, `notes`, `id`],
  [s.lbook]: [`balance`, `notes`, `id`],
  [s.bank]: [`bank_name`, `account_type`, `account_holder`, `account_number`, `ifscode`, `id`],
  [s.expense]: [`date`, `amount`, `pymt_mode`, `bank_mode`, `pymt_method`, `exp_type`, `description`, `bank_id`, `id`],
  [s.salary]: [`date`, `amount`, `entry_for`, `pymt_mode`, `description`, `bank_mode`, `bank_id`, `id`],
  resetpwd: [`password`, `id`],
  opening: [`opening_bal`, `opening_cr`, `comments`, `id`],
  [s.restrictions]: [`change_order_date`, `change_product_mode`, `manual_bill`, `edit_order`, `edit_payment`, `edit_entity`, `edit_party`, `edit_bank`, `edit_expense`, `edit_stock`, `edit_purchase`, `edit_settigns`, `delete_order`, `delete_payment`, `delete_stock`, `delete_purchase`, `delete_bank`, `delete_expense`, `delete_entity`, `view_sales`, `view_employees`, `view_partydues`, `view_expenses`, `view_orders`, `view_closing`, `view_purchase`, `create_bank`, `create_stock`, `create_entity`, `create_refund`, `create_purchase`, `create_user`, `id`],
  [s.pymtmethods]: [`method`, `default_bank`, `id`],
  [s.notes]: [`details`, `folder_id`, `status`, `entity`, `id`],
  [s.groups]: [`group_name`, `id`],
  [s.passbook]: [`bank_id`, `txn_date`, `description`, `reference`, `credit`, `debit`, `id`],
  [s.offers]: [`offer`, `sku`, `price`, `min_qty`, `validity`, `condition`, `description`, `id`],
  [s.dstk]: [`sku`, `qty`, `description`, `id`],
  [s.folders]: [`folder`, `id`],
  [s.emp_advance]: [`pymt_date`, `amount`, `pymt_mode`, `purpose`, `id`],
  [s.discounts]: [`disc_name`, `value`, `disc_type`, `id`],
  [s.sold]: [`sku`, `hsn`, `category`, `qty`, `product`, `pcode`, `size`, `unit`, `mrp`, `price`, `disc`, `gst`, `tax`, `net`, `gross`, `emp_id`, `disc_val`, `disc_per`, `id`],

}

// insert
const create = {
  [s.users]: [`name`, `username`, `password`, `contact`, `email`],
  [s.entity]: [`entity_id`, `entity_name`, `entity_type`, `tag_line`, `reg_num`, `pan_num`, `gst_num`, `reg_since`, `contact`, `email`, `website`, `address`, `city`, `state`, `state_code`, `pincode`],
  [s.party]: [`party_id`, `reg_date`, `party_type`, `title`, `party_name`, `contact`, `email`, `company`, `gender`, `aadhaar`, `pan_num`, `gst_number`, `birthday`, `address`, `city`, `pincode`, `state`, `state_code`, `country`, `opening_bal`, `opening_cr`, `entity`],
  [s.supplier]: [`sup_id`, `title`, `supplier_name`, `contact`, `email`, `gst_number`, `address`, `city`, `pincode`, `state`, `state_code`, `country`, `opening_bal`, `comments`, `user_id`],
  [s.contact]: [`party`, `party_id`, `type`, `contact`, `email`, `website`, `notes`, `entity`],
  [s.address]: [`party`, `type`, `address`, `htmladdress`, `city`, `pincode`, `state`, `state_code`, `lmark`, `notes`],
  [s.gst]: [`party`, `business_name`, `gst_number`, `address`, `state`, `pincode`],
  [s.stock]: [`sku`, `ean`, `hsn`, `upc`, `pcode`, `product`, `mrp`, `price`, `wsp`, `gst`, `purch_price`, `cost`, `cost_gst`, `unit`, `size`, `qty`, `type`, `discount`, `disc_type`, `colour`, `season`, `section`, `category`, `label`, `tag`, `brand`, `comments`, `purch_id`, `user_id`, `temp_id`],
  [s.orders]: [`party`, `order_id`, `inv_number`, `order_date`, `order_type`, `subtotal`, `discount`, `totaltax`, `manual_tax`, `freight`, `round_off`, `alltotal`, `previous_due`, `gst_type`, `tax_type`, `fin_year`, `status`, `adjustment`, `ship_id`, `rewards`, `redeem`, `notes`, `category`, `user_id`, `disc_id`, `disc_percent`, `entity`, `location`],
  [s.payments]: [`party`, `pymt_date`, `pymt_for`, `order_id`, `purch_id`, `amount`, `cash`, `bank`, `other`, `bank_mode`, `pymt_method`, `bank_id`, `txnid`, `adjustment`, `notes`, `entity`],
  [s.rewards]: [`order_id`, `party`, `rewards`, `redeemed`, `entity`],
  [s.express]: [`orderid`, `counterid`, `entity`],
  [s.purchase]: [`supid`, `order_date`, `order_number`, `bill_date`, `bill_type`, `bill_number`, `sub_total`, `bill_amount`, `discount`, `tax_amount`, `freight`, `gst_roundoff`, `quantity`, `fin_year`, `notes`, `user_id`],
  [s.settings]: [`entity`, `rewards`, `service_email`, `email_client`, `email_pwd`, `default_bank`],
  [s.activation]: [`activation_key`],
  [s.bank]: [`bank_name`, `account_type`, `account_holder`, `account_number`, `ifscode`, `entity`],
  [s.employee]: [`emp_id`, `emp_name`, `birthday`, `joining`, `bg`, `deg`, `father`, `mother`, `aadhaar`, `address`, `hometown`, `ecd`, `ref`, `gender`, `salary`, `contact`, `exprience`, `education`, `department`, `status`],
  [s.empsales]: [`emp_id`, `order_id`, `sales`],
  [s.hold]: [`user_id`, `date`, `bill_type`, `party`, `mtax`, `disc`, `disc_type`, `disc_percent`, `disc_notes`, `freight`, `pymt_amount`, `cash`, `bank`, `other`, `bank_mode`, `pymt_method`, `bank_id`, `txnid`, `pymt_notes`, `entity`],
  [s.holditems]: [`hold_id`, `sku`, `hsn`, `qty`, `product`, `pcode`, `size`, `mrp`, `disc`, `gst`],
  [s.salary]: [`emp_id`, `date`, `amount`, `entry_for`, `pymt_mode`, `bank_mode`, `bank_id`, `description`],
  [s.expense]: [`date`, `amount`, `pymt_mode`, `bank_mode`, `pymt_method`, `exp_type`, `description`, `bank_id`, `user_id`],
  [s.restrictions]: [`userid`],
  [s.pymtmethods]: [`method`, `default_bank`],
  [s.stockreturn]: [`purch_id`, `sku`, `product`, `pcode`, `qty`, `cost`, `cost_gst`, `size`, `unit`, `hsn`, `entity`],
  [s.notes]: [`details`, `folder_id`, `status`, `entity`],
  [s.groups]: [`group_name`],
  [s.members]: [`party`, `group_id`],
  [s.passbook]: [`bank_id`, `txn_date`, `description`, `reference`, `credit`, `debit`, `entity`],
  [s.offers]: [`offer`, `sku`, `price`, `min_qty`, `validity`, `condition`, `description`],
  [s.dstk]: [`sku`, `qty`, `description`],
  [s.folders]: [`folder`],
  [s.emp_advance]: [`emp_id`, `pymt_date`, `amount`, `pymt_mode`, `purpose`],
  [s.discounts]: [`disc_name`, `value`, `disc_type`],
  [s.sold]: [`order_id`, `sku`, `hsn`, `category`, `qty`, `product`, `pcode`, `size`, `unit`, `mrp`, `price`, `disc`, `gst`, `tax`, `net`, `gross`, `emp_id`, `disc_val`, `disc_per`, `entity`],
}

// views
const views = ['pymtfyear', 'stockavl', 'stock_view'];



module.exports = { create, update, views };



