'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('shipments', [
    { shipment_id: 1, order_id: 1, carrier: 'FedEx', status: 'delivered' },
    { shipment_id: 2, order_id: 2, carrier: 'UPS', status: 'delivered' },
    { shipment_id: 3, order_id: 3, carrier: 'DHL Express', status: 'delivered' },
    { shipment_id: 4, order_id: 4, carrier: 'USPS Priority', status: 'in_transit' },
    { shipment_id: 5, order_id: 5, carrier: 'FedEx Ground', status: 'delivered' },
    { shipment_id: 6, order_id: 6, carrier: 'UPS Express', status: 'preparing' },
    { shipment_id: 7, order_id: 7, carrier: 'DHL Standard', status: 'in_transit' },
    { shipment_id: 8, order_id: 8, carrier: 'FedEx', status: 'preparing' },
    { shipment_id: 9, order_id: 11, carrier: 'UPS Ground', status: 'preparing' }
  ], {});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('shipments', {}, {});
}
