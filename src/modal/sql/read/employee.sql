select
    `id`,
    `emp_name`,
    `emp_id`,
    `contact`,
    `exprience`,
    `education`,
    `gender`,
    date_format(`birthday`, '%d/%m/%Y') as `birthday`,
    date_format(`joining`, '%d/%m/%Y') as `joined_on`,
    `bg`,
    `deg`,
    `ecd`,
    `address`,
    `hometown`,
    `father`,
    `mother`,
    `ref`,
    `department`,
    `lwd`,
    `status`
from `employee`
order by `emp_name` asc;