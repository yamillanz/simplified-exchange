const OrderBook = require('../domain/OrderBook');
const Order = require('../domain/Order');

class OrderService {
  constructor() {
    this.orderBook = new OrderBook();
  }

  createNewOrder(data) {
    if (this.orderBook.processedOrders.has(data.id)) {
      // handler.reply(null, 'Order already processed');
      // return;
     throw new Error('Order already processed');
    }
    const order = new Order(
      data.id,
      data.type,
      data.price,
      data.quantity
    );
    this.orderBook.addOrder(order);
    return this.orderBook.matchOrders();
  }
}

module.exports = OrderService;