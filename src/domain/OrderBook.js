const async = require('async');

class OrderBook {
  constructor() {
    this.orders = [];
    this.processedOrders = new Set();
  }

  addOrder(order) {
    this.orders.push(order);
    if (this.processedOrders.has(order.id)) {
      return;
    }
    this.processedOrders.add(order.id);
    this.orders.push(order);
  }

  matchOrders() {
    const matchedOrders = [];
    const unmatchedOrders = [];

    async.each(this.orders, (order, callback) => {
      const match = this.orders.find((o) => o.type !== order.type && o.price === order.price);
      if (match) {
        matchedOrders.push({ order, match });
        this.orders = this.orders.filter((o) => o !== order && o !== match);
      } else {
        unmatchedOrders.push(order);
      }
      callback();
    });

    return { matchedOrders, unmatchedOrders };
  }
}

module.exports = OrderBook;
