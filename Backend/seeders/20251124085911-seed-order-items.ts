'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('order_items', [
      // Order 1 items
      {
        orderItem_id: 1,
        order_id: 1,
        substance_id: 1,
        quantity: 2,
        unitPrice: 25.50,
        subTotal: 51.00
      },
      {
        orderItem_id: 2,
        order_id: 1,
        substance_id: 2,
        quantity: 3,
        unitPrice: 18.00,
        subTotal: 54.00
      },
      {
        orderItem_id: 3,
        order_id: 1,
        substance_id: 5,
        quantity: 1,
        unitPrice: 20.50,
        subTotal: 20.50
      },
      // Order 2 items
      {orderItem_id: 4,
order_id: 2,
substance_id: 5,
quantity: 2,
unitPrice: 39.99,
subTotal: 79.98
},
// Order 3 items
{
orderItem_id: 5,
order_id: 3,
substance_id: 3,
quantity: 4,
unitPrice: 30.00,
subTotal: 120.00
},
{
orderItem_id: 6,
order_id: 3,
substance_id: 6,
quantity: 2,
unitPrice: 25.00,
subTotal: 50.00
},
{
orderItem_id: 7,
order_id: 3,
substance_id: 7,
quantity: 1,
unitPrice: 50.00,
subTotal: 50.00
},
// Order 4 items
{
orderItem_id: 8,
order_id: 4,
substance_id: 10,
quantity: 3,
unitPrice: 45.25,
subTotal: 135.75
},
{
orderItem_id: 9,
order_id: 4,
substance_id: 15,
quantity: 1,
unitPrice: 33.00,
subTotal: 33.00
},
// Order 5 items
{
orderItem_id: 10,
order_id: 5,
substance_id: 4,
quantity: 3,
unitPrice: 22.00,
subTotal: 66.00
},
{
orderItem_id: 11,
order_id: 5,
substance_id: 8,
quantity: 1,
unitPrice: 29.00,
subTotal: 29.00
},
// Order 6 items
{
orderItem_id: 12,
order_id: 6,
substance_id: 12,
quantity: 2,
unitPrice: 55.00,
subTotal: 110.00
},
{
orderItem_id: 13,
order_id: 6,
substance_id: 16,
quantity: 1,
unitPrice: 32.50,
subTotal: 32.50
},
// Order 7 items
{
orderItem_id: 14,
order_id: 7,
substance_id: 17,
quantity: 5,
unitPrice: 28.00,
subTotal: 140.00
},
{
orderItem_id: 15,
order_id: 7,
substance_id: 18,
quantity: 2,
unitPrice: 35.00,
subTotal: 70.00
},
// Order 8 items
{
orderItem_id: 16,
order_id: 8,
substance_id: 19,
quantity: 3,
unitPrice: 42.00,
subTotal: 126.00
},
{
orderItem_id: 17,
order_id: 8,
substance_id: 20,
quantity: 2,
unitPrice: 26.25,
subTotal: 52.50
},
// Order 9 items
{
orderItem_id: 18,
order_id: 9,
substance_id: 1,
quantity: 4,
unitPrice: 24.00,
subTotal: 96.00
},
{
orderItem_id: 19,
order_id: 9,
substance_id: 3,
quantity: 3,
unitPrice: 28.00,
subTotal: 84.00
},
{
orderItem_id: 20,
order_id: 9,
substance_id: 9,
quantity: 2,
unitPrice: 38.00,
subTotal: 76.00
},
// Order 10 items
{
orderItem_id: 21,
order_id: 10,
substance_id: 5,
quantity: 3,
unitPrice: 40.50,
subTotal: 121.50
},
// Order 11 items
{
orderItem_id: 22,
order_id: 11,
substance_id: 2,
quantity: 4,
unitPrice: 17.50,
subTotal: 70.00
},
{
orderItem_id: 23,
order_id: 11,
substance_id: 11,
quantity: 2,
unitPrice: 52.75,
subTotal: 105.50
},
// Order 12 items (cancelled order)
{
orderItem_id: 24,
order_id: 12,
substance_id: 7,
quantity: 2,
unitPrice: 40.00,
subTotal: 80.00
}
], {});
},async down(queryInterface, Sequelize) {
await queryInterface.bulkDelete('order_items', null, {});
}
};