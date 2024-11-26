const Link = require('grenache-nodejs-link');
const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http');
const OrderBook = require('./orderBook');
const async = require('async');
const OrderService = require('./application/OrderService');

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const peerServer = new PeerRPCServer(link, {
  timeout: 300000
});
peerServer.init();

const service = peerServer.transport('server');
service.listen(Math.floor(Math.random() * 1000) + 1024);
console.log('🚀 ~ Server started on port:', service.port);

const peerClient = new PeerRPCClient(link, {});
peerClient.init();

// const orderBook = new OrderBook();
const orderService = new OrderService();

const distributeOrder = (order) => {
  link.lookup('exchange_service', (err, peers) => {
    if (err) {
      console.error(err);
      return;
    }

    async.each(peers, (peer, callback) => {
      if (peer.port === service.port) {
        return callback();
      }
      peerClient.request(
        'exchange_service',
        { method: 'addOrder', data: order },
        { timeout: 30000 },
        (err, result) => {
          if (err) {
            console.log('🚀 distributeOrder ~ async.each ~ err:', err);
          }
          callback();
        }
      );
    });
  });
};

setInterval(() => {
  // console.log('🚀 ~ Server Announce, port:', service.port);
  // console.log('Server Announce!');
  link.announce('exchange_service', service.port, {});
}, 1000);

service.on('request', (rid, key, payload, handler) => {
  console.log('🚀 ~ service.on ~ rid:', rid);
  console.log('🚀 ~ service.on ~ key:', key);
  console.log('🚀 ~ service.on ~ Order received:', payload);
  const { method, data } = payload;
  if (method === 'addOrder') {
    try {
      const { matchedOrders, unmatchedOrders } = orderService.createNewOrder(data);

      matchedOrders.forEach(({ order, match }) => {
        console.log(`Matched order: ${order.id} with ${match.id}`);
      });

      unmatchedOrders.forEach((order) => {
        distributeOrder(order);
      });
    } catch (error) {
      console.error('Error processing order:', error);
      handler.reply(null, 'Order already processed');
    }
  }
  handler.reply(null, 'Order processed');
});
